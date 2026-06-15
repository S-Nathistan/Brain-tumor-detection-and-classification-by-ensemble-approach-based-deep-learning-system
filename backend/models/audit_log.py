from sqlalchemy import Column, Integer, String, DateTime, func, Text
from backend.db.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    user = Column(String(255), nullable=False) # Store name here for simplicity, or link to User ID
    role = Column(String(100))
    ip = Column(String(50))
    status = Column(String(50)) # Success, Failed, Warning
    details = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
