from fastapi import APIRouter, Depends, HTTPException, Header, Request
from jose import jwt
from backend.core.config import settings
from backend.core.audit import log_event
from sqlalchemy.orm import Session
from typing import List

from backend.db.database import get_db
from backend.models.patient import Patient
from backend.schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])

def get_user_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        return 0 # anonymous
    try:
        token = authorization.split()[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub"))
    except:
        return 0

@router.post("/", response_model=PatientRead)
def create_patient(body: PatientCreate, request: Request, db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    db_patient = db.query(Patient).filter(Patient.hospital_id == body.hospital_id).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Patient with this Hospital ID already exists")

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    log_event(db, "Patient Record Created", user_id=user_id, ip=request.client.host, details=f"Created ID: {body.hospital_id}")
    
    return new_patient

@router.get("/", response_model=List[PatientRead])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).order_by(Patient.id.desc()).all()

@router.get("/{id}", response_model=PatientRead)
def get_patient(id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{id}", response_model=PatientRead)
def update_patient(id: int, body: PatientUpdate, request: Request, db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    
    log_event(db, "Patient Record Updated", user_id=user_id, ip=request.client.host, details=f"Updated ID: {patient.hospital_id}")
    
    return patient

@router.delete("/{id}", status_code=204)
def delete_patient(id: int, request: Request, db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    log_event(db, "Patient Record Deleted", user_id=user_id, ip=request.client.host, details=f"Deleted ID: {patient.hospital_id}")
    db.delete(patient)
    db.commit()
    return None
