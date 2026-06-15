from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AuditLogBase(BaseModel):
    action: str
    user: str
    role: Optional[str] = None
    ip: Optional[str] = None
    status: Optional[str] = "Success"
    details: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogRead(AuditLogBase):
    id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
