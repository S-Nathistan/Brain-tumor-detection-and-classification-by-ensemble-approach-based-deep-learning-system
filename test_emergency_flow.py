from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.db.database import Base, get_db as db_get_db
from backend.models import admission  # noqa: F401
from backend.models import caretaker  # noqa: F401
from backend.models import chat_message  # noqa: F401
from backend.models import checkin  # noqa: F401
from backend.models import patient  # noqa: F401
from backend.models import result  # noqa: F401
from backend.models import user  # noqa: F401
from backend.models.patient import Patient
from backend.models.chat_message import ChatMessage
from backend.models.user import User
from backend.routers import mobile


def _critical_checkin_payload() -> dict:
    return {
        "headache": "Severe (very bad)",
        "seizure": "Yes (brief)",
        "energy": "Cannot get up",
        "nausea": "Vomited many times",
        "medication": "Missed all doses",
        "overall": "Much worse",
        "sleep": "Very little",
        "appetite": "Could not eat",
        "note": "Severe symptoms",
    }


def build_app(db_session, patient: Patient, clinician: User) -> FastAPI:
    app = FastAPI()
    app.include_router(mobile.router)

    def override_get_db():
        yield db_session

    app.dependency_overrides[db_get_db] = override_get_db
    app.dependency_overrides[mobile.get_mobile_patient] = lambda: (patient, "patient")

    @app.get("/dashboard/patient-alerts")
    def patient_alerts(limit: int = 50):
        rows = (
            db_session.query(ChatMessage, Patient)
            .join(Patient, ChatMessage.patient_id == Patient.id)
            .filter(ChatMessage.emergency == True)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": message.id,
                "patient_id": patient_row.id,
                "hospital_id": patient_row.hospital_id,
                "patient_name": patient_row.name,
                "doctor_name": patient_row.clinician.name if patient_row.clinician else None,
                "message": message.user_message,
                "reply": message.bot_reply,
                "topic": message.topic,
                "created_at": message.created_at.isoformat() if message.created_at else None,
                "emergency": bool(message.emergency),
            }
            for message, patient_row in rows
        ]

    return app


def make_session():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    return engine, SessionLocal()


def seed_patient_and_user(db_session):
    clinician = User(
        email="doctor@example.com",
        name="Dr. Alert",
        role="Clinician",
        password_hash="hash",
    )
    db_session.add(clinician)
    db_session.commit()
    db_session.refresh(clinician)

    patient = Patient(
        hospital_id="HOSP-1001",
        name="Demo Patient",
        assigned_doctor_id=clinician.id,
        tumour_type="Grade II Astrocytoma",
        risk_score="72%",
        doctor_notes="Needs close observation",
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient, clinician


def test_mobile_notify_reaches_dashboard_alert_feed():
    engine, db_session = make_session()
    try:
        patient, clinician = seed_patient_and_user(db_session)
        app = build_app(db_session, patient, clinician)
        client = TestClient(app)

        response = client.post(
            "/mobile/notify",
            json={"message": "Emergency alert from mobile SOS | Severe headache | Location: Home"},
        )
        assert response.status_code == 200, response.text
        assert response.json()["notified"] is True

        alerts = client.get("/dashboard/patient-alerts?limit=10")
        assert alerts.status_code == 200, alerts.text
        payload = alerts.json()
        assert len(payload) >= 1
        newest = payload[0]
        assert newest["patient_name"] == "Demo Patient"
        assert newest["hospital_id"] == "HOSP-1001"
        assert "Severe headache" in newest["message"]
    finally:
        db_session.close()
        engine.dispose()


def test_critical_checkin_marks_emergency():
    engine, db_session = make_session()
    try:
        patient, clinician = seed_patient_and_user(db_session)
        app = build_app(db_session, patient, clinician)
        client = TestClient(app)

        response = client.post("/mobile/checkins", json=_critical_checkin_payload())
        assert response.status_code == 200, response.text

        body = response.json()
        assert body["emergency"] is True
        assert body["level"] == "CRITICAL"
        assert body["patient_name"] == "Demo Patient"
    finally:
        db_session.close()
        engine.dispose()
