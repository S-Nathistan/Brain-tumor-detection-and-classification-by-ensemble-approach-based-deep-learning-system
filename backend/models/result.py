from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.db.database import Base


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=True)

    filename = Column(String)
    predicted_label = Column(String)
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Doctor confirmation fields (added for clinical workflow)
    confirmed_label = Column(String, nullable=True)     # what doctor decides
    pathology_grade = Column(String, nullable=True)     # I / II / III / IV
    confirmed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships — foreign_keys required because two FKs point to users.id
    user      = relationship("User", foreign_keys=[user_id], back_populates="results")
    confirmer = relationship("User", foreign_keys=[confirmed_by])
    patient   = relationship("Patient", back_populates="results")
    admission = relationship("Admission", back_populates="results")
