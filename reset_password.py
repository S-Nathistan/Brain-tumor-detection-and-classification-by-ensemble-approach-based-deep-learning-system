from backend.routers.auth import pwd_ctx
from backend.models.user import User
from backend.models.result import Result
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings

# Setup DB
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def reset_password():
    email = "test4@gmail.com"
    new_password = "1234"
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"Resetting password for {email}...")
        user.password_hash = pwd_ctx.hash(new_password)
        db.commit()
        print(f"Password reset to '{new_password}' successful.")
    else:
        print(f"User {email} not found.")

if __name__ == "__main__":
    reset_password()
