from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.user import User
from backend.models.result import Result
from backend.core.config import settings

# Adjust the database URL if needed (imported from config)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_users():
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Hash Start: {user.password_hash[:10] if user.password_hash else 'None'}")
    db.close()

if __name__ == "__main__":
    check_users()
