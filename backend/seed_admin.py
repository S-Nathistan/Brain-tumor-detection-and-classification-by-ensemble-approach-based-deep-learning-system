import sys
import os

from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Add the backend directory to sys.path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import SessionLocal, engine, Base

import backend.models.user
import backend.models.admission
import backend.models.result
import backend.models.patient
import backend.models.audit_log

# use the correct python namespace
from backend.models.user import User

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_super_admin():
    db: Session = SessionLocal()
    try:
        # Check if Super Admin exists
        admin = db.query(User).filter(User.email == "admin@neurosight.ai").first()
        if not admin:
            admin = User(
                email="admin@neurosight.ai",
                password_hash=pwd_ctx.hash("admin123"),
                name="Super Administrator",
                role="Super Admin",
                status=True
            )
            db.add(admin)
            db.commit()
            print("Successfully created Super Admin user.")
            print("Username (Email): admin@neurosight.ai")
            print("Password: admin123")
        else:
            print("Super Admin user already exists.")
            print("Username (Email): admin@neurosight.ai")
            
            # Optionally update password to something known if needed:
            admin.password_hash = pwd_ctx.hash("admin123")
            db.commit()
            print("Reset password to: admin123")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_super_admin()
