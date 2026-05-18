from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResultRead(BaseModel):
    id: int
    filename: str
    predicted_label: str
    confidence: float
    created_at: Optional[datetime] = None
    patient_id: Optional[int] = None
    # Doctor confirmation fields
    confirmed_label: Optional[str] = None
    pathology_grade: Optional[str] = None
    confirmed_by: Optional[int] = None
    confirmed_at: Optional[datetime] = None
    admission_id: Optional[int] = None
    # Resolved display names (populated by list endpoint)
    patient_name: Optional[str] = None
    patient_hospital_id: Optional[str] = None
    uploaded_by_name: Optional[str] = None
    confirmed_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class ConfirmRequest(BaseModel):
    confirmed_label: str
    pathology_grade: Optional[str] = None
