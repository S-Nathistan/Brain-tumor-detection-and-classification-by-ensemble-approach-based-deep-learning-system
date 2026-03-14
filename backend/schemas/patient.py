from pydantic import BaseModel
from typing import Optional

class PatientBase(BaseModel):
    hospital_id: str
    name: str
    age: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    symptoms: Optional[str] = None
    doctor_notes: Optional[str] = None
    tumour_type: Optional[str] = "Not Classified"
    risk_score: Optional[str] = "0%"
    joined_date: Optional[str] = None
    discharge_date: Optional[str] = "Pending"
    scan_report: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    symptoms: Optional[str] = None
    doctor_notes: Optional[str] = None
    tumour_type: Optional[str] = None
    risk_score: Optional[str] = None
    discharge_date: Optional[str] = None

class PatientRead(PatientBase):
    id: int
    class Config:
        from_attributes = True
