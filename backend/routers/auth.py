import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import secrets
from pydantic import BaseModel
from urllib.parse import quote

from backend.db.database import get_db
from backend.core.config import settings
from backend.models.user import User
from backend.schemas.user import UserCreate, UserLogin, UserRead, UserUpdate, SelfUpdate, Token
from backend.core.email_utils import create_password_reset_token, get_user_by_password_reset_token, send_welcome_email, send_password_reset_email
from backend.core.audit import log_event
from backend.core.security import get_current_active_user, get_current_user, normalize_role, require_admin

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

def create_access_token(sub: str):
    to_encode = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/signup", status_code=status.HTTP_403_FORBIDDEN)
def signup_disabled(request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    try:
        log_event(db, "Blocked Public Signup", ip=ip, status="Failed", details="Public registration is disabled")
    except Exception:
        pass
    raise HTTPException(status_code=403, detail="Public registration is disabled. Contact an administrator.")

@router.post("/register", response_model=UserRead)
def register(
    body: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # New users are activated after setting their password via one-time link.
    temporary_password = body.password or secrets.token_urlsafe(24)
    user = User(
        email=body.email,
        password_hash=pwd_ctx.hash(temporary_password),
        name=body.name,
        role=normalize_role(body.role),
        mobile=body.mobile,
        status=body.status,
        department=body.department,
        qualification=body.qualification,
        license_number=body.license_number,
        gender=body.gender,
    )
    db.add(user); db.commit(); db.refresh(user)

    activation_token = create_password_reset_token(db, user)
    activation_url = f"{settings.CORS_ORIGINS.rstrip('/')}/set-password?token={quote(activation_token)}"

    # Send welcome email with one-time password setup link.
    send_welcome_email(user.email, user.id, activation_url)
    
    log_event(db, "User Registered", user_id=current_user.id, ip=request.client.host, details=f"Admin created user: {user.email}")
    
    return user

@router.post("/login", response_model=Token)
def login(body: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_ctx.verify(body.password, user.password_hash):
        log_event(db, "Failed Login Attempt", ip=request.client.host, status="Failed", details=f"Invalid attempt for: {body.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status is False:
        log_event(db, "Failed Login Attempt", user_id=user.id, ip=request.client.host, status="Failed", details=f"Deactivated account login attempt: {user.email}")
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    log_event(db, "User Login", user_id=user.id, ip=request.client.host, details="Successful authentication")
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if user and user.status:
        token = create_password_reset_token(db, user)
        reset_url = f"{settings.CORS_ORIGINS.rstrip('/')}/set-password?token={quote(token)}"
        send_password_reset_email(user.email, reset_url)
        log_event(db, "Password Reset Requested", user_id=user.id, ip=request.client.host, details="Password reset email sent")
    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/set-password")
def set_password(body: SetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = get_user_by_password_reset_token(db, body.token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.password_hash = pwd_ctx.hash(body.new_password)
    user.status = True
    user.password_reset_token_hash = None
    user.password_reset_token_expires_at = None
    db.add(user)
    db.commit()

    log_event(db, "Password Set", user_id=user.id, ip=request.client.host, details="Password initialized via activation link")
    return {"detail": "Password set successfully"}

# Minimal /me using token in Authorization: Bearer <token>

@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserRead)
def update_me(
    body: SelfUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if body.name is not None:
        current_user.name = body.name
    if body.mobile is not None:
        current_user.mobile = body.mobile
    if body.new_password:
        if not body.current_password or not pwd_ctx.verify(body.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        current_user.password_hash = pwd_ctx.hash(body.new_password)
    db.commit()
    db.refresh(current_user)
    log_event(db, "Profile Updated", user_id=current_user.id, ip=request.client.host if request.client else "unknown", details="User updated own profile")
    return current_user

_AVATAR_DIR = "uploads/avatars"
_ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}

@router.post("/me/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are allowed")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    ext = _ALLOWED_TYPES[file.content_type]
    os.makedirs(_AVATAR_DIR, exist_ok=True)

    # Remove old avatar files for this user (different extension)
    for old_ext in _ALLOWED_TYPES.values():
        old_path = os.path.join(_AVATAR_DIR, f"{current_user.id}.{old_ext}")
        if os.path.exists(old_path):
            os.remove(old_path)

    filename = f"{current_user.id}.{ext}"
    with open(os.path.join(_AVATAR_DIR, filename), "wb") as f:
        f.write(contents)

    current_user.profile_picture = f"/avatars/{filename}"
    db.commit()
    db.refresh(current_user)

    log_event(db, "Avatar Updated", user_id=current_user.id,
              ip=request.client.host if request and request.client else "unknown",
              details="Profile picture updated")
    return current_user


@router.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

@router.get("/clinicians", response_model=list[UserRead])
def list_active_clinicians(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return db.query(User).filter(User.role == "Clinician", User.status == True).all()

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    deleted_user_email = user.email
    deleted_user_role = user.role
    
    db.delete(user)
    db.commit()

    log_event(
        db,
        "User Deleted",
        user_id=current_user.id,
        ip=request.client.host if request.client else "unknown",
        details=f"Deleted user: {deleted_user_email} (role: {deleted_user_role})",
    )
    return None

@router.put("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if body.name is not None:
        user.name = body.name
    if body.mobile is not None:
        user.mobile = body.mobile
    if body.status is not None:
        user.status = body.status
    if body.role is not None:
        user.role = normalize_role(body.role)

    if user.id == current_user.id and user.status is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
            
    db.commit()
    db.refresh(user)
    return user
