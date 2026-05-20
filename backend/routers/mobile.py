from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Header
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.database import get_db
from backend.models.caretaker import Caretaker
from backend.models.patient import Patient

router = APIRouter(prefix="/mobile", tags=["mobile"])

_TOKEN_EXPIRE_DAYS = 30


def _create_mobile_token(patient_id: int, role: str) -> str:
    exp = datetime.utcnow() + timedelta(days=_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(patient_id), "role": role, "exp": exp},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM,
    )


def _patient_payload(patient: Patient) -> dict:
    return {
        "id":              patient.id,
        "hospital_id":     patient.hospital_id,
        "name":            patient.name,
        "tumour_type":     patient.tumour_type or "Not Classified",
        "risk_score":      patient.risk_score or "0%",
        "assigned_doctor": patient.clinician.name if patient.clinician else None,
    }


# ── dependency used by future authenticated mobile endpoints ─────────────────

def get_mobile_patient(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> tuple[Patient, str]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        patient_id = int(payload["sub"])
        role = payload.get("role", "patient")
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")
    return patient, role


# ── request schemas ──────────────────────────────────────────────────────────

class PatientLoginRequest(BaseModel):
    hospital_id: str

class CaretakerLoginRequest(BaseModel):
    hospital_id: str
    phone: str


# ── endpoints ────────────────────────────────────────────────────────────────

@router.post("/login")
def patient_login(body: PatientLoginRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.hospital_id == body.hospital_id.strip().upper()
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")

    return {
        "token":   _create_mobile_token(patient.id, "patient"),
        "patient": _patient_payload(patient),
    }


@router.post("/caretaker-login")
def caretaker_login(body: CaretakerLoginRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.hospital_id == body.hospital_id.strip().upper()
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")

    caretaker = db.query(Caretaker).filter(
        Caretaker.patient_id == patient.id,
        Caretaker.phone == body.phone.strip(),
    ).first()
    if not caretaker:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Caretaker not registered")

    return {
        "token":     _create_mobile_token(patient.id, "caretaker"),
        "patient":   _patient_payload(patient),
        "caretaker": {
            "id":           caretaker.id,
            "name":         caretaker.name,
            "relation": caretaker.relation,
        },
    }
