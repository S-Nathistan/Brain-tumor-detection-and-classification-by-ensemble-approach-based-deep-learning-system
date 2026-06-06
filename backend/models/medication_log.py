from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.db.database import Base


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id         = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id    = Column(Integer, nullable=False)
    med_index  = Column(Integer, nullable=False)
    slot       = Column(String(10), nullable=False)   # e.g. '08:00'
    taken_date = Column(String(10), nullable=False)   # YYYY-MM-DD
    taken_at   = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="medication_logs")
