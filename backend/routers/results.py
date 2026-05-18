from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request, Form
from sqlalchemy.orm import Session, selectinload
import uuid
import shutil
import logging
from pathlib import Path
from datetime import datetime, timezone

from backend.db.database import get_db
from backend.models.result import Result
from backend.models.admission import Admission
from backend.schemas.result import ResultRead, ConfirmRequest
from backend.core.audit import log_event
from backend.core.config import settings
from backend.core.detector import predict
from backend.core.security import get_current_active_user
from backend.models.patient import Patient
from backend.models.user import User

router = APIRouter(prefix="/results", tags=["results"])
logger = logging.getLogger(__name__)

_LABEL_MAP = {
    "glioma":      "Glioma",
    "meningioma":  "Meningioma",
    "no_tumor":    "No Tumour",
    "pituitary":   "Pituitary",
}

def _normalise_label(raw: str) -> str:
    return _LABEL_MAP.get(raw.lower(), raw.replace("_", " ").title())

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}


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

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    tmp_path = uploads / f"tmp_{uuid.uuid4()}.{ext}"

    try:
        with tmp_path.open("wb") as f:
            shutil.copyfileobj(file.file, f)

        raw_label, confidence = predict(str(tmp_path))
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
# 2. The Combined Upload & Analyze Endpoint
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

    file_extension = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    safe_filename = f"{uuid.uuid4()}.{file_extension}"
    dst = uploads / safe_filename

    with dst.open("wb") as f:
        shutil.copyfileobj(file.file, f)

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
    return db.query(Result).filter(Result.patient_id == patient_id).order_by(Result.created_at.desc()).all()


@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    r = db.query(Result).filter(Result.id == result_id, Result.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    return r
