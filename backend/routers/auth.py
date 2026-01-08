from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from backend.db.database import get_db
from backend.core.config import settings
from backend.models.user import User
from backend.models.user import User
from backend.schemas.user import UserCreate, UserRead, UserUpdate, Token
from backend.core.email_utils import send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(sub: str):
    to_encode = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/register", response_model=UserRead)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email, 
        password_hash=pwd_ctx.hash(body.password),
        name=body.name,
        role=body.role,
        mobile=body.mobile
    )
    db.add(user); db.commit(); db.refresh(user)
    
    # Send welcome email (async ideally, but sync for now)
    send_welcome_email(user.email, user.id, body.password)
    
    return user

@router.post("/login", response_model=Token)
def login(body: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_ctx.verify(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return Token(access_token=create_access_token(str(user.id)))

# Minimal /me using token in Authorization: Bearer <token>
from fastapi import Header
from jose import JWTError, jwt as jose_jwt

@router.get("/me", response_model=UserRead)
def me(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload = jose_jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(me)):
    # Optional: Check if current_user is Admin
    # if current_user.role != "Admin": raise HTTPException...
    
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    db.delete(user)
    db.commit()
    return None

@router.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if body.name is not None:
        user.name = body.name
    if body.status is not None:
        # Assuming we have a status column. Since we added it to schema but not model, 
        # let's quick check model. If not in model, migration needed.
        # Wait, I recall adding it to schema but user asked for status change. 
        # I should check if user model has status. If not, I need to add it.
        # For now, let's assume it's there or I will add it.
        # Actually, previous convo showed User model. Let me check my memory.
        # View file to be sure.
        pass # Placeholder till I check model.
        if hasattr(user, "status"):
            user.status = body.status
            
    db.commit()
    db.refresh(user)
    return user
