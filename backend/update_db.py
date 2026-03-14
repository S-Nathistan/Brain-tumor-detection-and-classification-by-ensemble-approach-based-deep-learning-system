from sqlalchemy import create_engine, text
from backend.core.config import settings

def update_db():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN status BOOLEAN DEFAULT TRUE"))
            conn.commit()
            print("Added 'status' column to users table")
        except Exception as e:
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    update_db()
