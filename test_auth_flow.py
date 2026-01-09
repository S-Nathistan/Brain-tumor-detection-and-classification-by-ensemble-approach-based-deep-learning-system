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

def test_auth():
    # 1. Test Hash/Verify logic standalone
    password = "testpassword"
    hashed = pwd_ctx.hash(password)
    print(f"Hash generated: {hashed}")
    
    if pwd_ctx.verify(password, hashed):
        print("Standalone verification: SUCCESS")
    else:
        print("Standalone verification: FAILED")

    # 2. Check existing user (if we knew the password, but we don't)
    # So let's create a temporary test user
    test_email = "autotest@example.com"
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    print(f"Creating test user: {test_email} with password: {password}")
    new_user = User(
        email=test_email,
        password_hash=pwd_ctx.hash(password),
        name="Auto Test",
        role="Clinician"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Verify from DB
    user_db = db.query(User).filter(User.email == test_email).first()
    if user_db:
        if pwd_ctx.verify(password, user_db.password_hash):
             print(f"DB User verification: SUCCESS")
        else:
             print(f"DB User verification: FAILED - Hash mismatch")
    else:
        print("DB User creation failed")
        
    # Cleanup
    db.delete(new_user)
    db.commit()
    print("Test user cleaned up")

if __name__ == "__main__":
    test_auth()
