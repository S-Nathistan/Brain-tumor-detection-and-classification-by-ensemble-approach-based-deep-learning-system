from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from jose import jwt

from backend.db.database import get_db
from backend.core.config import settings
from backend.models.user import User
from backend.models.result import Result

router = APIRouter(prefix="/dashboard", tags=["dashboard"]) 

def get_user_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return int(payload.get("sub"))


@router.get("/summary")
def summary(db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    # Total users breakdown
    total_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    total_users_by_role = {role: count for role, count in total_counts}
    
    # Active sessions breakdown (approximate by recent results)
    since = datetime.utcnow() - timedelta(hours=24)
    active_counts = db.query(User.role, func.count(Result.id)).join(User).filter(Result.created_at >= since).group_by(User.role).all()
    active_sessions_by_role = {role: count for role, count in active_counts}

    return {
        "total_users": total_users_by_role,
        "active_sessions": active_sessions_by_role,
        "pending_approvals": 0, # Deprecated
    }


@router.get("/audit-logs")
def audit_logs(limit: int = 5, db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    logs = []
    # Recent results
    recent_results = db.query(Result).order_by(Result.created_at.desc()).limit(limit).all()
    for r in recent_results:
        user_email = getattr(r.user, "email", "unknown")
        name = user_email.split("@")[0]
        logs.append({
            "message": f"{name} uploaded new MRI scan",
            "timestamp": r.created_at.isoformat(),
        })

    # If not enough logs, include recent user registrations
    if len(logs) < limit:
        need = limit - len(logs)
        recent_users = db.query(User).order_by(User.created_at.desc()).limit(need).all()
        for u in recent_users:
            logs.append({
                "message": f"New user registered: {u.email}",
                "timestamp": u.created_at.isoformat(),
            })

    return logs[:limit]
