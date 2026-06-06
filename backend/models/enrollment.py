from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, unique=True)
    token = Column(String(600), nullable=True)
    status = Column(String(20), default="pending")   # pending | sent | active
    enrolled_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    first_login_at = Column(DateTime(timezone=True), nullable=True)
    send_method = Column(String(10), nullable=True)   # sms | email | both | none
    preferred_language = Column(String(10), nullable=True)   # en | si | ta
    reminder_time = Column(String(10), nullable=True)        # HH:MM e.g. 20:00
    last_active_at = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("Patient", foreign_keys=[patient_id])
    enrolled_by = relationship("User", foreign_keys=[enrolled_by_id])
