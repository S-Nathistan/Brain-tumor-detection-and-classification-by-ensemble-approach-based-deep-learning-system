from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from backend.db.database import get_db
from backend.models.admission import Admission
from backend.models.patient import Patient
from backend.core.security import get_current_active_user
from backend.core.audit import log_event
from backend.models.user import User

router = APIRouter(prefix="/admissions", tags=["admissions"])


class AdmissionCreate(BaseModel):
    patient_id: int
    admission_date: Optional[str] = None


class AdmissionRead(BaseModel):
    id: int
    patient_id: int
    episode_number: int
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


@router.post("/", response_model=AdmissionRead)
def create_admission(
    body: AdmissionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.query(Patient).filter(Patient.id == body.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    count = db.query(Admission).filter(Admission.patient_id == body.patient_id).count()

    admission = Admission(
        patient_id=body.patient_id,
        episode_number=count + 1,
        admission_date=body.admission_date or str(date.today()),
        status="Active",
    )
    db.add(admission)
    db.commit()
    db.refresh(admission)

    ip = request.client.host if request.client else "unknown"
    try:
        log_event(
            db, "New Admission",
            user_id=current_user.id,
            ip=ip,
            details=f"Admission #{admission.episode_number} created for Patient ID {body.patient_id}",
        )
    except Exception:
        pass

    return admission


@router.get("/patient/{patient_id}", response_model=list[AdmissionRead])
def list_admissions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(Admission)
        .filter(Admission.patient_id == patient_id)
        .order_by(Admission.id.desc())
        .all()
    )


class AdmissionDischarge(BaseModel):
    discharge_date: Optional[str] = None  # defaults to today if omitted


@router.patch("/{admission_id}/discharge", response_model=AdmissionRead)
def discharge_admission(
    admission_id: int,
    body: AdmissionDischarge,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")

    admission.discharge_date = body.discharge_date or str(date.today())
    admission.status = "Discharged"
    db.commit()
    db.refresh(admission)

    ip = request.client.host if request.client else "unknown"
    try:
        log_event(
            db, "Patient Discharged",
            user_id=current_user.id,
            ip=ip,
            details=f"Admission #{admission.episode_number} discharged for Patient ID {admission.patient_id}",
        )
    except Exception:
        pass

    return admission
