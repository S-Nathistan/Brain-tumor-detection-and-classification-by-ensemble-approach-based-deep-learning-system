<#
.SYNOPSIS
  Start the NeuroSight system (backend + frontend, optional chatbot + mobile).

.DESCRIPTION
  Frees any stale listeners on the target ports, launches each service detached,
  records every root PID to .neurosight-pids.json at the repo root, then waits for
  the backend /health endpoint to return 200 (model warmup can take several minutes).

  Use stop-system.ps1 to shut everything down cleanly (kills full process trees).

.PARAMETER Mobile
  Also start the mobile PWA (vite, port 5174).

.PARAMETER NoChatbot
  Skip the chatbot microservice even if its model file is present.

.PARAMETER NoFrontend
  Start backend only (no dashboard).

.PARAMETER NoWait
  Do not block waiting for backend warmup; return as soon as services are launched.

.PARAMETER WaitTimeoutSec
  Max seconds to wait for backend /health (default 900 = 15 min).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\start-system.ps1
  powershell -ExecutionPolicy Bypass -File scripts\start-system.ps1 -Mobile
#>
[CmdletBinding()]
param(
    [switch] $Mobile,
    [switch] $NoChatbot,
    [switch] $NoFrontend,
    [switch] $NoWait,
    [int]    $WaitTimeoutSec = 900
)

$ErrorActionPreference = 'Stop'

# -- Paths --------------------------------------------------------------------
$Root    = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$VenvPy  = Join-Path $Root 'backend\.venv\Scripts\python.exe'
$PidFile = Join-Path $Root '.neurosight-pids.json'
$ChatbotModel = Join-Path $Root 'backend\chatbot\model\neurosight_distilbert\model.safetensors'

if (-not (Test-Path $VenvPy)) {
    throw "Backend venv python not found at $VenvPy. Create it: cd backend; py -3.11 -m venv .venv; then pip install -r requirements.txt"
}

# -- Helpers ------------------------------------------------------------------
function Stop-PortOwner {
    param([int] $Port)
    $owners = (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue).OwningProcess |
        Sort-Object -Unique
    foreach ($procId in $owners) {
        if ($procId) {
            Write-Host "  freeing port $Port (killing tree PID $procId)" -ForegroundColor DarkYellow
            & taskkill /PID $procId /T /F 2>$null | Out-Null
        }
    }
}

function Start-NsService {
    param(
        [string]   $Name,
        [string]   $File,
        [string[]] $ArgList,
        [string]   $WorkDir,
        [int]      $Port
    )
    Stop-PortOwner -Port $Port
    Write-Host "starting $Name (port $Port)..." -ForegroundColor Cyan
    $p = Start-Process -FilePath $File -ArgumentList $ArgList -WorkingDirectory $WorkDir `
        -WindowStyle Hidden -PassThru
    return [pscustomobject]@{ name = $Name; pid = $p.Id; port = $Port }
}

# -- Launch -------------------------------------------------------------------
$started = @()

# Backend (always)
$started += Start-NsService -Name 'backend' -File $VenvPy `
    -ArgList @('-m','uvicorn','backend.main:app','--reload','--port','8000') `
    -WorkDir $Root -Port 8000

# Chatbot microservice (optional - only if model present and not disabled)
if (-not $NoChatbot) {
    if (Test-Path $ChatbotModel) {
        $started += Start-NsService -Name 'chatbot' -File $VenvPy `
            -ArgList @('-m','uvicorn','backend.chatbot.microservice:app','--port','8001') `
            -WorkDir $Root -Port 8001
    } else {
        Write-Host "skipping chatbot - model.safetensors missing (backend uses TF-IDF fallback)" -ForegroundColor DarkGray
    }
}

# Frontend dashboard (default on)
if (-not $NoFrontend) {
    $started += Start-NsService -Name 'frontend' -File 'npm.cmd' `
        -ArgList @('run','dev') -WorkDir (Join-Path $Root 'frontend') -Port 5173
}

# Mobile app (opt-in)
if ($Mobile) {
    $started += Start-NsService -Name 'mobile' -File 'npm.cmd' `
        -ArgList @('run','dev') -WorkDir (Join-Path $Root 'mobile') -Port 5174
}

# -- Record PIDs --------------------------------------------------------------
$record = [pscustomobject]@{
    started_at = (Get-Date).ToString('s')
    services   = $started
}
$record | ConvertTo-Json -Depth 5 | Out-File -FilePath $PidFile -Encoding utf8
Write-Host ""
Write-Host "PIDs recorded -> $PidFile" -ForegroundColor Green
$started | ForEach-Object { Write-Host ("  {0,-9} PID {1,-7} :{2}" -f $_.name, $_.pid, $_.port) }

# -- Wait for backend warmup --------------------------------------------------
if ($NoWait) {
    Write-Host "`nLaunched (no-wait). Backend warming up; /health 200 when model loaded." -ForegroundColor Yellow
    return
}

Write-Host "`nWaiting for backend warmup (model load, up to $WaitTimeoutSec s)..." -ForegroundColor Yellow
$deadline = (Get-Date).AddSeconds($WaitTimeoutSec)
$live = $false
while ((Get-Date) -lt $deadline) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $live = $true; break }
    } catch {}
    Write-Host ("  warming... {0:HH:mm:ss}" -f (Get-Date)) -ForegroundColor DarkGray
    Start-Sleep -Seconds 15
}

Write-Host ""
if ($live) {
    Write-Host "SYSTEM LIVE" -ForegroundColor Green
    Write-Host "  Backend API : http://127.0.0.1:8000  (docs: /docs, health: /health)"
    if (-not $NoFrontend) { Write-Host "  Dashboard   : http://localhost:5173" }
    if ($Mobile)          { Write-Host "  Mobile      : http://localhost:5174" }
} else {
    Write-Host "Backend not healthy within $WaitTimeoutSec s - still warming or failed." -ForegroundColor Red
    Write-Host "Wait longer, or run stop-system.ps1 and retry." -ForegroundColor Red
}
