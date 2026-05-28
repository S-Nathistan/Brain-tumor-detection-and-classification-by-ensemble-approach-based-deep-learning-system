from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.db.database import Base


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_by_role = Column(String(20), nullable=False, default="patient")
    trigger_source = Column(String(100), nullable=False, default="Patient taps \"Daily Check-in\"")
    reminder_frequency = Column(String(50), nullable=False, default="Weekly reminder")
    headache = Column(String(50), nullable=False)
    seizure = Column(String(50), nullable=False)
    energy = Column(String(50), nullable=False)
    nausea = Column(String(50), nullable=False)
    medication = Column(String(50), nullable=False)
    overall = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    score = Column(Integer, nullable=False)
    level = Column(String(20), nullable=False)
    emergency = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="checkins")