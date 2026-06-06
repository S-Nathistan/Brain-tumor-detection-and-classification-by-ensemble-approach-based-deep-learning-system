import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.db.database import SessionLocal
# import all models to ensure mappers configured
import backend.models.user        # noqa: F401
import backend.models.admission   # noqa: F401
import backend.models.result      # noqa: F401
import backend.models.patient     # noqa: F401
import backend.models.audit_log   # noqa: F401
import backend.models.caretaker   # noqa: F401
import backend.models.checkin     # noqa: F401
import backend.models.chat_message # noqa: F401
from backend.models.user import User

def main():
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id.desc()).limit(20).all()
        for u in users:
            print(f'id={u.id} email={u.email} role={u.role} status={u.status} name={u.name}')
    finally:
        db.close()

if __name__ == '__main__':
    main()
