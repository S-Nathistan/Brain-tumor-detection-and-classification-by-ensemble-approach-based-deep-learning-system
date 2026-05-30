from pydantic import BaseModel, EmailStr
from typing import Optional, List
from backend.schemas.result import ResultRead


class CaretakerRead(BaseModel):
    id: int
    name: str
    phone: str
    relation: Optional[str] = None

    class Config:
        from_attributes = True


class PatientBase(BaseModel):
    hospital_id: str
    name: str
    age: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    from_location: Optional[str] = None
    occupation: Optional[str] = None
    symptoms: Optional[str] = None
    presenting_complaint: Optional[str] = None
    symptom_analysis: Optional[str] = None
    differential_analysis: Optional[str] = None
    complications: Optional[str] = None
    risk_factor: Optional[str] = None
    systemic_review: Optional[str] = None
    past_medical_history: Optional[str] = None
    family_history: Optional[str] = None
    social_history: Optional[str] = None
    allergy_history: Optional[str] = None
    doctor_notes: Optional[str] = None      # From Nirojini
    examination_findings: Optional[str] = None
    muscle_power: Optional[str] = None
    reflex: Optional[str] = None
    assigned_doctor_id: Optional[int] = None
    joined_date: Optional[str] = None
    discharge_date: Optional[str] = "Pending"
    next_visit_date: Optional[str] = None
    tumour_type: Optional[str] = "Not Classified"
    risk_score: Optional[str] = "0%"
    scan_report: Optional[str] = None       # From Nirojini

class PatientCreate(PatientBase):
    caretaker_name: Optional[str] = None
    caretaker_phone: Optional[str] = None
    caretaker_relation: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    from_location: Optional[str] = None
    occupation: Optional[str] = None
    symptoms: Optional[str] = None
    presenting_complaint: Optional[str] = None
    symptom_analysis: Optional[str] = None
    differential_analysis: Optional[str] = None
    complications: Optional[str] = None
    risk_factor: Optional[str] = None
    systemic_review: Optional[str] = None
    past_medical_history: Optional[str] = None
    family_history: Optional[str] = None
    social_history: Optional[str] = None
    allergy_history: Optional[str] = None
    doctor_notes: Optional[str] = None      # From Nirojini
    assigned_doctor_id: Optional[int] = None
    discharge_date: Optional[str] = None
    tumour_type: Optional[str] = None
    risk_score: Optional[str] = None
    examination_findings: Optional[str] = None
    muscle_power: Optional[str] = None
    reflex: Optional[str] = None
    next_visit_date: Optional[str] = None

# 1. The Main Response Schema (Includes Shameeha's MRI results link)
class PatientResponse(PatientBase):
    id: int
    results: List[ResultRead] = []
    caretakers: List[CaretakerRead] = []
    assigned_doctor: Optional[str] = None       # resolved clinician name, set by router
    current_joined_date: Optional[str] = None
    current_discharge_date: Optional[str] = None

    class Config:
        from_attributes = True

# 2. The Alias (Prevents crashes if Nirojini's code imports "PatientRead")
PatientRead = PatientResponse 

# 3. OCR Schema (Shameeha's Document Scanner)
class OCRResponse(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    symptomsNotes: str = ""
    assignedDoctor: str = ""
    occupation: str = ""
    from_location: str = ""
    caretakerName: str = ""
    caretakerPhone: str = ""
    caretakerRelation: str = ""