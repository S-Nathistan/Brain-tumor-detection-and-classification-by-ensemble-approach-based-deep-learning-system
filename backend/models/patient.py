from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
# Basic Information
    age = Column(String(50)) 
    gender = Column(String(20))
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(String(255)) # Kept Shameeha's longer 255 limit
    from_location = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)

    # Medical Information
    symptoms = Column(Text)
    presenting_complaint = Column(Text, nullable=True)  # doctor's formal write-up
    symptom_analysis = Column(Text, nullable=True)
    differential_analysis = Column(Text, nullable=True)
    complications = Column(Text, nullable=True)
    risk_factor = Column(Text, nullable=True)
    systemic_review = Column(Text, nullable=True)
    past_medical_history = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    social_history = Column(Text, nullable=True)
    allergy_history = Column(Text, nullable=True)
    doctor_notes = Column(Text) # Added by Nirojini
    examination_findings = Column(Text, nullable=True)
    muscle_power = Column(Text, nullable=True)
    reflex = Column(Text, nullable=True)
    assigned_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    clinician = relationship("User", foreign_keys=[assigned_doctor_id])
    
    # Status & Scans
    tumour_type = Column(String(100), default="Not Classified")
    risk_score = Column(String(50), default="0%")
    scan_report = Column(String(200)) # Added by Nirojini
    
    # Dates
    joined_date = Column(String(50)) 
    discharge_date = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) # Added by Nirojini
    
    # Relationships
    results = relationship("Result", back_populates="patient", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan", order_by="Admission.id")
    caretakers = relationship("Caretaker", back_populates="patient", cascade="all, delete-orphan")
    checkins = relationship("CheckIn", back_populates="patient", cascade="all, delete-orphan", order_by="CheckIn.id.desc()")
    chat_messages = relationship("ChatMessage", back_populates="patient", cascade="all, delete-orphan", order_by="ChatMessage.id.desc()")
