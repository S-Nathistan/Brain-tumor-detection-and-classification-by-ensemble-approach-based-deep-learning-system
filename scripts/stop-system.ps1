<#
.SYNOPSIS
  Stop the NeuroSight system started by start-system.ps1.

.DESCRIPTION
  Reads .neurosight-pids.json and kills each recorded process TREE (taskkill /T),
  which cleanly takes down uvicorn's --reload parent + worker and vite's node
  children. Then sweeps the known ports (8000, 8001, 5173, 5174) to clear any
  stale or orphaned listeners, and deletes the PID file.

  Safe to run even if no PID file exists - it falls back to port-based cleanup.

.PARAMETER Ports
  Override the port list swept after killing tracked PIDs.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\stop-system.ps1
#>
[CmdletBinding()]
param(
    [int[]] $Ports = @(8000, 8001, 5173, 5174)
)

$ErrorActionPreference = 'Continue'

$Root    = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$PidFile = Join-Path $Root '.neurosight-pids.json'

function Stop-Tree {
    param([int] $ProcId, [string] $Label)
    if (-not $ProcId) { return }
    if (Get-Process -Id $ProcId -ErrorAction SilentlyContinue) {
        Write-Host "  killing $Label tree (PID $ProcId)" -ForegroundColor DarkYellow
        & taskkill /PID $ProcId /T /F 2>$null | Out-Null
    } else {
        Write-Host "  $Label (PID $ProcId) already gone" -ForegroundColor DarkGray
    }
}

function Stop-PortOwner {
    param([int] $Port)
    $owners = (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue).OwningProcess |
        Sort-Object -Unique
    foreach ($procId in $owners) {
        if ($procId) {
            Write-Host "  sweeping port $Port (tree PID $procId)" -ForegroundColor DarkYellow
            & taskkill /PID $procId /T /F 2>$null | Out-Null
        }
    }
}

# -- Kill tracked PIDs --------------------------------------------------------
if (Test-Path $PidFile) {
    Write-Host "stopping tracked services from $PidFile" -ForegroundColor Cyan
    try {
        $record = Get-Content $PidFile -Raw | ConvertFrom-Json
        foreach ($svc in $record.services) {
            Stop-Tree -ProcId $svc.pid -Label $svc.name
        }
    } catch {
        Write-Host "  PID file unreadable ($($_.Exception.Message)) - using port sweep only" -ForegroundColor Red
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "no PID file - using port sweep only" -ForegroundColor DarkGray
}

# -- Sweep ports (catches stale / orphaned listeners) -------------------------
Write-Host "sweeping ports: $($Ports -join ', ')" -ForegroundColor Cyan
foreach ($port in $Ports) { Stop-PortOwner -Port $port }

# -- Verify -------------------------------------------------------------------
Start-Sleep -Milliseconds 500
$stillUp = @()
foreach ($port in $Ports) {
    $o = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
    if ($o) { $stillUp += "port $port (PID $o)" }
}
Write-Host ""
if ($stillUp.Count -eq 0) {
    Write-Host "SYSTEM STOPPED - all ports free." -ForegroundColor Green
} else {
    Write-Host "Still listening: $($stillUp -join '; ')" -ForegroundColor Red
    Write-Host "Re-run, or kill manually: Get-NetTCPConnection -LocalPort <port>" -ForegroundColor Red
}
