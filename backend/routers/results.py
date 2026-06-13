from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile, File, HTTPException, Request, Form
from sqlalchemy.orm import Session, selectinload
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone

from backend.db.database import get_db, SessionLocal
from backend.models.result import Result
from backend.models.admission import Admission
from backend.schemas.result import ResultRead, ConfirmRequest
from backend.core.audit import log_event
from backend.core.config import settings
from backend.core.detector import predict
from backend.core.gradcam import predict_xai
from backend.core.security import get_current_active_user
from backend.core import jobs as xai_jobs
from backend.models.patient import Patient
from backend.models.user import User
from blockchain.medical_history_chain import (
    encrypt_data, upload_to_pinata, send_hash_to_blockchain, load_deployment
)

router = APIRouter(prefix="/results", tags=["results"])
logger = logging.getLogger(__name__)


def _build_record_text(patient: Patient, result: Result, confirmer_name: str) -> str:
    """Assemble a structured plaintext record from all available patient + result data."""
    lines = [
        "=== NeuroSight Medical Record ===",
        f"Patient ID      : {patient.hospital_id}",
        f"Name            : {patient.name}",
        f"Age             : {patient.age or 'N/A'}",
        f"Gender          : {patient.gender or 'N/A'}",
        f"Occupation      : {patient.occupation or 'N/A'}",
        f"Location        : {patient.from_location or 'N/A'}",
        "",
        "--- MRI Analysis ---",
        f"Result ID       : #{result.id}",
        f"AI Prediction   : {result.predicted_label} ({result.confidence * 100:.1f}% confidence)",
        f"Confirmed Dx    : {result.confirmed_label or 'Pending'}",
        f"Pathology Grade : {result.pathology_grade or 'N/A'}",
        f"Confirmed By    : {confirmer_name}",
        f"Confirmed At    : {result.confirmed_at.isoformat() if result.confirmed_at else 'N/A'}",
        f"Scan File       : {result.filename}",
        "",
        "--- Medical History ---",
    ]

    fields = [
        ("Presenting Complaint",  patient.presenting_complaint),
        ("Symptoms",              patient.symptoms),
        ("Symptom Analysis",      patient.symptom_analysis),
        ("Differential Analysis", patient.differential_analysis),
        ("Complications",         patient.complications),
        ("Risk Factors",          patient.risk_factor),
        ("Systemic Review",       patient.systemic_review),
        ("Past Medical History",  patient.past_medical_history),
        ("Family History",        patient.family_history),
        ("Social History",        patient.social_history),
        ("Allergy History",       patient.allergy_history),
        ("Examination Findings",  patient.examination_findings),
        ("Muscle Power",          patient.muscle_power),
        ("Reflex",                patient.reflex),
        ("Doctor Notes",          patient.doctor_notes),
    ]
    for label, value in fields:
        if value and str(value).strip():
            lines.append(f"{label:<25}: {value.strip()}")

    lines += [
        "",
        f"Tumour Type     : {patient.tumour_type or 'N/A'}",
        f"Risk Score      : {patient.risk_score or 'N/A'}",
        f"Record Generated: {datetime.now(timezone.utc).isoformat()}",
    ]
    return "\n".join(lines)


def _blockchain_write_task(patient_id: int, result_id: int) -> None:
    """Background task — runs in threadpool, uses its own DB session."""
    cfg = settings
    if not all([cfg.FERNET_KEY, cfg.PINATA_API_KEY, cfg.PINATA_SECRET_KEY, cfg.ETH_PRIVATE_KEY]):
        logger.warning("Blockchain not configured — skipping auto-write for result #%d", result_id)
        return

    db = SessionLocal()
    try:
        result  = db.query(Result).filter(Result.id == result_id).first()
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not result or not patient:
            logger.error("Blockchain task: result or patient not found (result_id=%d)", result_id)
            return

        confirmer_name = result.confirmer.name if result.confirmer else "Unknown"
        record_text    = _build_record_text(patient, result, confirmer_name)
        chain_id       = str(patient.hospital_id)

        contract_address, abi = load_deployment()
        ciphertext = encrypt_data(record_text, cfg.FERNET_KEY.encode())
        ipfs_hash  = upload_to_pinata(ciphertext, chain_id, cfg.PINATA_API_KEY, cfg.PINATA_SECRET_KEY)
        receipt    = send_hash_to_blockchain(chain_id, ipfs_hash, cfg.ETH_PRIVATE_KEY, contract_address, abi)
        tx_hash    = receipt["transactionHash"].hex()

        log_event(
            db, "Blockchain Auto-Write",
            user_id=result.confirmed_by,
            ip="system",
            details=f"Result #{result_id} anchored | tx: {tx_hash} | cid: {ipfs_hash}",
        )
        logger.info("Blockchain write OK — result #%d | tx: %s", result_id, tx_hash)
    except Exception as exc:
        logger.error("Blockchain auto-write failed for result #%d: %s", result_id, exc, exc_info=True)
    finally:
        db.close()

_LABEL_MAP = {
    "glioma":      "Glioma",
    "meningioma":  "Meningioma",
    "no_tumor":    "No Tumour",
    "pituitary":   "Pituitary",
}

def _normalise_label(raw: str) -> str:
    return _LABEL_MAP.get(raw.lower(), raw.replace("_", " ").title())

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
ALLOWED_IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff"}
MAX_MRI_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


def _safe_image_ext(filename: str | None) -> str:
    """Extension for the stored file. Whitelisted only — never raw user input,
    so traversal sequences or doubled extensions can't reach the filesystem."""
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if ext in ALLOWED_IMAGE_EXTS:
            return ext
    return "jpg"


def _save_upload_capped(file: UploadFile, dst: Path, max_bytes: int) -> None:
    """Stream the upload to disk, aborting (and cleaning up) past max_bytes."""
    written = 0
    try:
        with dst.open("wb") as out:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum upload size is {max_bytes // (1024 * 1024)} MB.",
                    )
                out.write(chunk)
    except HTTPException:
        dst.unlink(missing_ok=True)
        raise


# ==========================================================
# 1. Standalone Inference Endpoint (no DB write)
# ==========================================================
@router.post("/predict-tumour")
async def predict_tumour(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """Accept an MRI image, run the full ensemble pipeline, return class + confidence."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Upload a JPEG, PNG, BMP, TIFF, or WebP image.",
        )

    uploads = Path(settings.UPLOAD_DIR)
    uploads.mkdir(parents=True, exist_ok=True)

    tmp_path = uploads / f"tmp_{uuid.uuid4()}.{_safe_image_ext(file.filename)}"

    try:
        _save_upload_capped(file, tmp_path, MAX_MRI_UPLOAD_BYTES)
        raw_label, confidence = predict(str(tmp_path))
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"Inference failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Inference failed. Check server logs.")
    finally:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)

    label = _normalise_label(raw_label)
    return {
        "predicted_class":    label,
        "confidence":         round(confidence, 4),
        "confidence_percent": f"{confidence * 100:.2f}%",
    }


# ==========================================================
# 2. XAI Endpoint — starts background job, returns job_id immediately
# ==========================================================

def _run_xai_job(job_id: str, image_path: str, result_id: int) -> None:
    def _on_progress(partial_data: dict) -> None:
        xai_jobs.update_partial(job_id, partial_data)

    try:
        result = predict_xai(image_path, progress_callback=_on_progress)
        xai_jobs.set_result(job_id, result)
        # Persist to DB so future requests return instantly
        db = SessionLocal()
        try:
            r = db.query(Result).filter(Result.id == result_id).first()
            if r:
                r.xai_report = result
                db.commit()
        finally:
            db.close()
    except Exception as exc:
        logger.error("XAI job %s failed: %s", job_id, exc, exc_info=True)
        xai_jobs.set_error(job_id, str(exc))


@router.post("/{result_id}/xai")
def xai_for_result(
    result_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Start XAI pipeline in background. Poll /xai/jobs/{job_id} for result."""
    r = db.query(Result).filter(Result.id == result_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Result not found")

    job_id = xai_jobs.create_job()
    background_tasks.add_task(_run_xai_job, job_id, r.filename, result_id)
    return {"job_id": job_id, "status": "pending"}


@router.get("/xai/jobs/{job_id}")
async def get_xai_job(
    job_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Poll XAI job status. Returns {status, result, error}.

    async so the in-memory dict read runs on the event loop and is never
    starved by the CPU-bound XAI job running in the threadpool.
    """
    job = xai_jobs.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{result_id}/xai")
def get_stored_xai(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return the persisted XAI report for a result, or 404 if not yet generated."""
    r = db.query(Result).filter(Result.id == result_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Result not found")
    if not r.xai_report:
        raise HTTPException(status_code=404, detail="XAI report not yet generated")
    return r.xai_report


# ==========================================================
# 3. The Combined Upload & Analyze Endpoint
# ==========================================================
@router.post("/upload", response_model=ResultRead)
def upload_scan(
    request: Request,
    file: UploadFile = File(...),
    patient_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Upload a JPEG, PNG, BMP, TIFF, or WebP image.",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    uploads = Path(settings.UPLOAD_DIR)
    uploads.mkdir(parents=True, exist_ok=True)

    safe_filename = f"{uuid.uuid4()}.{_safe_image_ext(file.filename)}"
    dst = uploads / safe_filename

    _save_upload_capped(file, dst, MAX_MRI_UPLOAD_BYTES)

    try:
        raw_label, conf = predict(str(dst))
    except RuntimeError as exc:
        dst.unlink(missing_ok=True)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        dst.unlink(missing_ok=True)
        logger.error(f"Inference failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Inference failed. Check server logs.")

    label = _normalise_label(raw_label)

    # Link to the patient's active admission (if one exists)
    active_admission = (
        db.query(Admission)
        .filter(Admission.patient_id == patient_id, Admission.status == "Active")
        .order_by(Admission.id.desc())
        .first()
    )

    result = Result(
        user_id=current_user.id,
        patient_id=patient_id,
        admission_id=active_admission.id if active_admission else None,
        filename=str(dst),
        predicted_label=label,
        confidence=conf,
    )
    db.add(result)

    patient.tumour_type = label
    patient.risk_score = f"{conf*100:.1f}%"

    db.commit()
    db.refresh(result)
    db.refresh(patient)

    ip = request.client.host if request.client else "unknown"
    try:
        log_event(db, "MRI Upload", user_id=current_user.id, ip=ip, details=f"Uploaded for Patient ID {patient_id}: {file.filename}")
        log_event(db, "Model Inference", user_id=current_user.id, ip=ip, details=f"Classification: {label} ({conf*100:.1f}% confidence)")
    except Exception as e:
        print(f"Audit log write failed in results upload: {e}")

    return result


# ==========================================================
# 3. Doctor Confirm / Override Endpoint
# ==========================================================
@router.patch("/{result_id}/confirm", response_model=ResultRead)
def confirm_result(
    result_id: int,
    body: ConfirmRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    r = db.query(Result).filter(Result.id == result_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Result not found")

    r.confirmed_label = body.confirmed_label
    r.pathology_grade = body.pathology_grade
    r.confirmed_by = current_user.id
    r.confirmed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(r)

    ip = request.client.host if request.client else "unknown"
    try:
        log_event(
            db, "Doctor Confirmation",
            user_id=current_user.id,
            ip=ip,
            details=f"Result #{result_id} confirmed as '{body.confirmed_label}', Grade {body.pathology_grade}",
        )
    except Exception:
        pass

    # Auto-write full patient record + confirmed MRI result to blockchain
    if r.patient_id:
        background_tasks.add_task(_blockchain_write_task, r.patient_id, r.id)

    return r


# ==========================================================
# 4. Fetching Endpoints
# ==========================================================

def _enrich(r: Result) -> ResultRead:
    obj = ResultRead.model_validate(r)
    obj.patient_name        = r.patient.name        if r.patient   else None
    obj.patient_hospital_id = r.patient.hospital_id if r.patient   else None
    obj.uploaded_by_name    = r.user.name            if r.user      else None
    obj.confirmed_by_name   = r.confirmer.name       if r.confirmer else None
    return obj

def _results_query(db: Session):
    return (
        db.query(Result)
        .options(
            selectinload(Result.patient),
            selectinload(Result.user),
            selectinload(Result.confirmer),
        )
    )

@router.get("/", response_model=list[ResultRead])
def list_results(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    q = _results_query(db)
    if current_user.role in ("Super Admin", "Admin"):
        rows = q.order_by(Result.id.desc()).all()
    elif current_user.role == "Clinician":
        assigned_ids = [p.id for p in db.query(Patient.id).filter(Patient.assigned_doctor_id == current_user.id)]
        rows = q.filter(Result.patient_id.in_(assigned_ids)).order_by(Result.id.desc()).all()
    else:
        rows = q.filter(Result.user_id == current_user.id).order_by(Result.id.desc()).all()
    return [_enrich(r) for r in rows]


@router.get("/patient/{patient_id}")
def get_patient_results(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Same scoping as list_results: admins see all, clinicians only their
    # assigned patients, everyone else only their own uploads.
    q = db.query(Result).filter(Result.patient_id == patient_id)
    if current_user.role in ("Super Admin", "Admin"):
        pass
    elif current_user.role == "Clinician":
        if patient.assigned_doctor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not assigned to this patient")
    else:
        q = q.filter(Result.user_id == current_user.id)
    return q.order_by(Result.created_at.desc()).all()


@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    r = db.query(Result).filter(Result.id == result_id, Result.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return r
