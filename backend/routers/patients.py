from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session, selectinload
from typing import List
import pytesseract
from PIL import Image
import io
import re
import fitz  # PyMuPDF

from backend.core.config import settings
from backend.core.audit import log_event
from backend.core.security import get_current_active_user
from backend.db.database import get_db
from backend.models.patient import Patient
from backend.models.caretaker import Caretaker
from backend.models.user import User

from backend.schemas.patient import PatientCreate, PatientRead, PatientResponse, PatientUpdate, OCRResponse, CaretakerRead
from pydantic import BaseModel as _BaseModel
from typing import Optional as _Optional

class CaretakerCreate(_BaseModel):
    name: str
    phone: str
    relation: _Optional[str] = None

class CaretakerUpdate(_BaseModel):
    name: _Optional[str] = None
    phone: _Optional[str] = None
    relation: _Optional[str] = None

# Add this line if you are on Windows and Tesseract is installed here:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

router = APIRouter(prefix="/patients", tags=["patients"])

# ==========================
# 1. OCR ENDPOINT (Added by Shameeha)
# ==========================
@router.post("/ocr-extract", response_model=OCRResponse)
async def extract_medical_report(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename.lower().endswith(".pdf"):
            pdf_document = fitz.open("pdf", contents)
            first_page = pdf_document.load_page(0)
            pix = first_page.get_pixmap()
            img_data = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_data))
        else:
            image = Image.open(io.BytesIO(contents))
            
        extracted_text = pytesseract.image_to_string(image)
        data = OCRResponse()
        
        name_match = re.search(r'(?i)(?:Name|Patient):\s*([A-Za-z\s]+)(?=\n|$)', extracted_text)
        if name_match: data.name = name_match.group(1).strip()
            
        age_match = re.search(r'(?i)Age:\s*(\d+)', extracted_text)
        if age_match: data.age = age_match.group(1).strip()
            
        gender_match = re.search(r'(?i)Gender:\s*(Male|Female|Other)', extracted_text)
        if gender_match: data.gender = gender_match.group(1).strip().capitalize()
            
        doc_match = re.search(r'(?i)(?:Doctor|Consultant):\s*(Dr\.\s*[A-Za-z\s\.]+)', extracted_text)
        if doc_match: data.assignedDoctor = doc_match.group(1).strip()

        symp_match = re.search(r'(?i)(?:Symptoms|Clinical Notes):\s*(.*?)(?=\n\n|$)', extracted_text, re.DOTALL)
        if symp_match: data.symptomsNotes = " ".join(symp_match.group(1).split())

        return data
    except Exception as e:
        print(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")

# ==========================
# 2. CRUD ENDPOINTS (Combined)
# ==========================

# Create (Accepts both /patients and /patients/ with Audit Logging)
@router.post("", response_model=PatientResponse)
@router.post("/", response_model=PatientResponse, include_in_schema=False)
def create_patient(
    body: PatientCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_patient = db.query(Patient).filter(Patient.hospital_id == body.hospital_id).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Patient with this Hospital ID already exists")

    patient_data = body.model_dump(exclude={"caretaker_name", "caretaker_phone", "caretaker_relation"})
    new_patient = Patient(**patient_data)
    db.add(new_patient)
    db.flush()  # get new_patient.id without committing

    if body.caretaker_name and body.caretaker_name.strip():
        db.add(Caretaker(
            patient_id=new_patient.id,
            name=body.caretaker_name.strip(),
            phone=(body.caretaker_phone or "").strip(),
            relation=body.caretaker_relation or None,
        ))

    db.commit()
    db.refresh(new_patient)

    log_event(db, "Patient Record Created", user_id=current_user.id, ip=request.client.host, details=f"Created ID: {body.hospital_id}")

    return new_patient

# Read All
@router.get("", response_model=List[PatientResponse])
@router.get("/", response_model=List[PatientResponse], include_in_schema=False)
def get_all_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    query = db.query(Patient).options(selectinload(Patient.admissions), selectinload(Patient.clinician), selectinload(Patient.caretakers))
    if current_user.role == "Clinician":
        query = query.filter(Patient.assigned_doctor_id == current_user.id)
    patients = query.order_by(Patient.id.desc()).all()
    out = []
    for p in patients:
        obj = PatientResponse.model_validate(p)
        obj.assigned_doctor = p.clinician.name if p.clinician else None
        if p.admissions:
            latest = p.admissions[-1]  # relationship ordered by id asc, so last = most recent
            obj.current_joined_date = latest.admission_date
            obj.current_discharge_date = latest.discharge_date or "Pending"
        else:
            obj.current_joined_date = p.joined_date
            obj.current_discharge_date = p.discharge_date or "Pending"
        out.append(obj)
    return out

# Read One
@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    patient = db.query(Patient).options(selectinload(Patient.clinician), selectinload(Patient.caretakers)).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    obj = PatientResponse.model_validate(patient)
    obj.assigned_doctor = patient.clinician.name if patient.clinician else None
    return obj

# Update
@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    body: PatientUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    
    # Audit Log (Nirojini's feature)
    log_event(db, "Patient Record Updated", user_id=current_user.id, ip=request.client.host, details=f"Updated ID: {db_patient.hospital_id}")
    
    return db_patient

# Delete
@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    deleted_hospital_id = db_patient.hospital_id
    db.delete(db_patient)
    db.commit()
    
    # Audit Log (Nirojini's feature)
    log_event(db, "Patient Record Deleted", user_id=current_user.id, ip=request.client.host, details=f"Deleted ID: {deleted_hospital_id}")
    
    # JSON response (Shameeha's feature)
    return {"message": "Patient deleted"}


# ── Caretaker endpoints ───────────────────────────────────────────────────────

@router.get("/{patient_id}/caretakers", response_model=List[CaretakerRead])
def list_caretakers(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db.query(Caretaker).filter(Caretaker.patient_id == patient_id).all()


@router.post("/{patient_id}/caretakers", response_model=CaretakerRead, status_code=201)
def add_caretaker(
    patient_id: int,
    body: CaretakerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    caretaker = Caretaker(
        patient_id=patient_id,
        name=body.name.strip(),
        phone=body.phone.strip(),
        relation=body.relation,
    )
    db.add(caretaker)
    db.commit()
    db.refresh(caretaker)
    return caretaker


@router.delete("/{patient_id}/caretakers/{caretaker_id}", status_code=204)
def remove_caretaker(
    patient_id: int,
    caretaker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    caretaker = db.query(Caretaker).filter(
        Caretaker.id == caretaker_id,
        Caretaker.patient_id == patient_id,
    ).first()
    if not caretaker:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    db.delete(caretaker)
    db.commit()


@router.patch("/{patient_id}/caretakers/{caretaker_id}", response_model=CaretakerRead)
def update_caretaker(
    patient_id: int,
    caretaker_id: int,
    body: CaretakerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    caretaker = db.query(Caretaker).filter(
        Caretaker.id == caretaker_id,
        Caretaker.patient_id == patient_id,
    ).first()
    if not caretaker:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(caretaker, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(caretaker)
    return caretaker