from collections.abc import Callable

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.database import get_db
from backend.models.user import User

ALLOWED_ROLES = {"Super Admin", "Admin", "Clinician", "Assistant"}


def normalize_role(role: str | None) -> str:
    if not role:
        return "Clinician"

    normalized = " ".join(part.capitalize() for part in role.strip().split())
    if normalized not in ALLOWED_ROLES:
        allowed = ", ".join(sorted(ALLOWED_ROLES))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid role. Allowed roles: {allowed}",
        )
    return normalized


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    return authorization.split()[1]


def _decode_token_subject(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = _extract_bearer_token(authorization)
    user_id = _decode_token_subject(token)

    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return current_user


def require_roles(*roles: str) -> Callable:
    normalized_required = {normalize_role(role) for role in roles}

    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in normalized_required:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        return current_user

    return dependency


def require_admin(current_user: User = Depends(require_roles("Super Admin", "Admin"))) -> User:
    return current_user
