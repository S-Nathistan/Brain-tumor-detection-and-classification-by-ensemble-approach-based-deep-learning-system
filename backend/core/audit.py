from sqlalchemy.orm import Session
from backend.models.audit_log import AuditLog
from backend.models.user import User
from typing import Optional

def log_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    ip: Optional[str] = None,
    status: str = "Success",
    details: Optional[str] = None
):
    # Fetch user info if ID provided
    user_name = "System"
    role = "System"
    if user_id:
        user_obj = db.query(User).filter(User.id == user_id).first()
        if user_obj:
            user_name = user_obj.name or user_obj.email
            role = user_obj.role

    new_log = AuditLog(
        action=action,
        user=user_name,
        role=role,
        ip=ip or "unknown",
        status=status,
        details=details
    )
    db.add(new_log)
    db.commit()
    return new_log
