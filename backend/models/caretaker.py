from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base


class Caretaker(Base):
    __tablename__ = "caretakers"

    id         = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    name       = Column(String(100), nullable=False)
    phone      = Column(String(50),  nullable=False, index=True)
    relation   = Column(String(50))   # e.g. Spouse, Parent, Sibling, Child
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="caretakers")
