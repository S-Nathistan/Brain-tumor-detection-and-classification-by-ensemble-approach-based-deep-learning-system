from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    episode_number = Column(Integer, default=1)
    admission_date = Column(String(50))
    discharge_date = Column(String(50), nullable=True)
    status = Column(String(20), default="Active")  # Active | Discharged
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="admissions")
    results = relationship("Result", back_populates="admission")
