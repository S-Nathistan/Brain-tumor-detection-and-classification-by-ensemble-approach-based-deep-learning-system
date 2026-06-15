import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.db.database import SessionLocal
# import all models to ensure SQLAlchemy mappers are configured
import backend.models.user        # noqa: F401
import backend.models.admission   # noqa: F401
import backend.models.result      # noqa: F401
import backend.models.patient     # noqa: F401
import backend.models.audit_log   # noqa: F401
import backend.models.caretaker   # noqa: F401
import backend.models.checkin     # noqa: F401
import backend.models.chat_message # noqa: F401
from backend.models.patient import Patient
from backend.models.checkin import CheckIn

def main():
    db = SessionLocal()
    try:
        patients = db.query(Patient).order_by(Patient.id.desc()).limit(10).all()
        if not patients:
            print('No patients found')
            return
        for p in patients:
            chk_count = db.query(CheckIn).filter(CheckIn.patient_id==p.id).count()
            latest = db.query(CheckIn).filter(CheckIn.patient_id==p.id).order_by(CheckIn.id.desc()).first()
            print(f'Patient id={p.id} name="{p.name}" hospital_id={p.hospital_id} checkins={chk_count}')
            if latest:
                print(f'  Latest: id={latest.id} created_at={latest.created_at} score={latest.score} level={latest.level} emergency={latest.emergency} note={latest.note}')
    finally:
        db.close()

if __name__ == '__main__':
    main()
