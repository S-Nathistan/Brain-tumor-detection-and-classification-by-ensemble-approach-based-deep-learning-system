from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    role = Column(String(50), default="Clinician")
    mobile = Column(String(20), nullable=True)
    status = Column(Boolean, default=True)
    password_hash = Column(String(255), nullable=False)
    password_reset_token_hash = Column(String(255), nullable=True)
    password_reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    department = Column(String(100), nullable=True)
    qualification = Column(String(255), nullable=True)
    license_number = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    profile_picture = Column(String(500), nullable=True)

    results = relationship("Result", foreign_keys="[Result.user_id]", back_populates="user")
