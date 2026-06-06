from datetime import datetime, timedelta, timezone
import re

from fastapi import APIRouter, Depends, HTTPException, status, Header
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.database import get_db
from backend.models.admission import Admission
from backend.models.chat_message import ChatMessage
from backend.models.caretaker import Caretaker
from backend.models.checkin import CheckIn
from backend.models.medication_log import MedicationLog
from backend.models.enrollment import Enrollment
from backend.models.patient import Patient
from backend.models.result import Result
from backend.routers.treatment_plans import TreatmentPlan
from backend.chatbot.classifier import get_classifier

router = APIRouter(prefix="/mobile", tags=["mobile"])

_TOKEN_EXPIRE_DAYS = 30


def _create_mobile_token(patient_id: int, role: str) -> str:
    exp = datetime.utcnow() + timedelta(days=_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(patient_id), "role": role, "exp": exp},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM,
    )


def _patient_payload(patient: Patient) -> dict:
    return {
        "id":              patient.id,
        "hospital_id":     patient.hospital_id,
        "name":            patient.name,
        "tumour_type":     patient.tumour_type or "Not Classified",
        "risk_score":      patient.risk_score or "0%",
        "assigned_doctor": patient.clinician.name if patient.clinician else None,
        "monitoring_frequency": _monitoring_frequency(patient.tumour_type),
        "next_visit_date": patient.next_visit_date,
    }


def _monitoring_frequency(tumour_type: str | None) -> str:
    value = (tumour_type or "").strip().lower()
    if not value or value in {"not classified", "unknown"}:
        return "Reminder not configured"
    if "no tumor" in value or "no tumour" in value:
        return "No reminder"
    if "grade i" in value or "grade ii" in value:
        return "Weekly reminder"
    if "grade iii" in value or "grade iv" in value:
        return "Daily reminder"
    return "Reminder not configured"


def _score_answer(value: str, mapping: dict[str, int]) -> int:
    return mapping.get(value, 0)


def _derive_level(score: int, seizure_value: str) -> tuple[str, bool, str]:
    seizure_yes = seizure_value != "No"
    if seizure_yes:
        return "CRITICAL", True, "Seizure reported. Go to hospital now."
    if score <= 3:
        return "GREEN", False, "Your health looks stable today. Keep taking your medication."
    if score <= 7:
        return "AMBER", False, "Monitor your symptoms and keep an eye on any changes."
    if score <= 12:
        return "RED", False, "Your symptoms need prompt medical review today."
    return "CRITICAL", False, "Your symptoms are critical. Please seek emergency care now."


def _compact_text(value: str | None, limit: int = 140) -> str | None:
    if not value:
        return None
    text = " ".join(str(value).split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _safe_join(values: list[str | None], separator: str = " | ") -> str:
    parts = [str(value).strip() for value in values if value and str(value).strip()]
    return separator.join(parts)


def _has_emergency_language(message: str) -> bool:
    lowered = message.lower()
    return any(
        term in lowered
        for term in [
            "emergency",
            "call 1990",
            "1990",
            "seizure",
            "cannot breathe",
            "can't breathe",
            "severe chest pain",
            "collapse",
            "unconscious",
        ]
    )


def _latest_checkin_message(db: Session, patient_id: int) -> CheckIn | None:
    return (
        db.query(CheckIn)
        .filter(CheckIn.patient_id == patient_id)
        .order_by(CheckIn.id.desc())
        .first()
    )


def _latest_result(db: Session, patient_id: int) -> Result | None:
    return (
        db.query(Result)
        .filter(Result.patient_id == patient_id)
        .order_by(Result.id.desc())
        .first()
    )


def _latest_admission(db: Session, patient_id: int) -> Admission | None:
    return (
        db.query(Admission)
        .filter(Admission.patient_id == patient_id)
        .order_by(Admission.id.desc())
        .first()
    )


def _latest_treatment_plans(db: Session, patient_id: int) -> list[TreatmentPlan]:
    return (
        db.query(TreatmentPlan)
        .filter(TreatmentPlan.patient_id == patient_id)
        .order_by(TreatmentPlan.id.desc())
        .limit(3)
        .all()
    )


def _patient_context(db: Session, patient: Patient) -> dict:
    latest_result = _latest_result(db, patient.id)
    latest_admission = _latest_admission(db, patient.id)
    latest_checkin = _latest_checkin_message(db, patient.id)
    plans = _latest_treatment_plans(db, patient.id)

    diagnosis_parts = [patient.tumour_type]
    if latest_result and latest_result.pathology_grade:
        diagnosis_parts.append(f"Grade {latest_result.pathology_grade}")
    elif latest_result and latest_result.predicted_label:
        if latest_result.predicted_label != patient.tumour_type:
            diagnosis_parts.append(latest_result.predicted_label)

    plan_summary = "; ".join(
        _compact_text(
            _safe_join([
                plan.title,
                plan.plan_type,
                plan.medications,
                plan.therapy_schedule,
                plan.surgery_details,
                plan.notes,
            ], " - "),
            120,
        )
        for plan in plans
        if _safe_join([
            plan.title,
            plan.plan_type,
            plan.medications,
            plan.therapy_schedule,
            plan.surgery_details,
            plan.notes,
        ], " - ")
    ) or "No treatment plan is recorded yet."

    latest_scan = None
    if latest_result:
        label = latest_result.confirmed_label or latest_result.predicted_label
        grade = f"Grade {latest_result.pathology_grade}" if latest_result.pathology_grade else None
        latest_scan = _safe_join([label, grade])

    admission_info = _safe_join([
        f"episode {latest_admission.episode_number}" if latest_admission else None,
        latest_admission.status if latest_admission else None,
        latest_admission.admission_date if latest_admission else None,
    ]) if latest_admission else None

    checkin_info = None
    if latest_checkin:
        checkin_info = _safe_join([
            f"score {latest_checkin.score}",
            latest_checkin.level,
            "recent seizure" if latest_checkin.seizure != "No" else None,
        ])

    return {
        "patient_name": patient.name,
        "hospital_id": patient.hospital_id,
        "diagnosis": _safe_join(diagnosis_parts, ", ") or patient.tumour_type or "Not classified",
        "doctor": patient.clinician.name if patient.clinician else None,
        "plan_summary": plan_summary,
        "latest_scan": latest_scan,
        "admission_info": admission_info,
        "checkin_info": checkin_info,
        "latest_checkin": latest_checkin,
        "latest_result": latest_result,
        "latest_admission": latest_admission,
    }


def _detect_language(text: str) -> str:
    for ch in text:
        cp = ord(ch)
        if 0x0D80 <= cp <= 0x0DFF:
            return "si"
        if 0x0B80 <= cp <= 0x0BFF:
            return "ta"
    return "en"


def _answer_chat(message: str, context: dict, language: str = "en") -> tuple[str, str, bool]:
    """
    Calls RAG microservice on port 8001.
    Falls back to SVC classifier if microservice unavailable.
    """
    import httpx

    # Try RAG microservice first
    try:
        response = httpx.post(
            "http://127.0.0.1:8001/chat",
            json={
                "message": message,
                "language": language,
                "context": {
                    "patient_name": context.get("patient_name", ""),
                    "diagnosis": context.get("diagnosis", ""),
                    "doctor": context.get("doctor", ""),
                    "plan_summary": context.get("plan_summary", ""),
                    "latest_scan": context.get("latest_scan", ""),
                    "checkin_info": context.get("checkin_info", ""),
                }
            },
            timeout=30.0
        )
        if response.status_code == 200:
            data = response.json()
            return data["reply"], data["intent"], data["is_emergency"]
    except Exception as e:
        print(f"[Chat] RAG microservice unavailable: {e}, falling back to SVC")

    # Fallback to existing SVC classifier
    classifier = get_classifier()
    if classifier is not None:
        return classifier.answer(message, context)

    # Final fallback rule based
    return (
        f"Based on your record, your diagnosis is {context.get('diagnosis', 'unknown')}. "
        "Please consult your doctor for more information.",
        "general",
        False,
    )

# ── dependency used by future authenticated mobile endpoints ─────────────────

def get_mobile_patient(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> tuple[Patient, str]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.split()[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        patient_id = int(payload["sub"])
        role = payload.get("role", "patient")
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")
    return patient, role


# ── request schemas ──────────────────────────────────────────────────────────

class PatientLoginRequest(BaseModel):
    hospital_id: str
    language: str | None = None

class CaretakerLoginRequest(BaseModel):
    hospital_id: str
    phone: str


class CheckInCreateRequest(BaseModel):
    headache: str
    seizure: str
    energy: str
    nausea: str
    medication: str
    overall: str
    sleep: str | None = None
    appetite: str | None = None
    note: str | None = None
    trigger_source: str | None = None


class CheckInResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    hospital_id: str
    submitted_by_role: str
    trigger_source: str
    reminder_frequency: str
    headache: str
    seizure: str
    energy: str
    nausea: str
    medication: str
    overall: str
    sleep: str | None = None
    appetite: str | None = None
    note: str | None = None
    score: int
    level: str
    emergency: bool
    created_at: datetime
    message: str


class ChatCreateRequest(BaseModel):
    patient_id: int | None = None
    message: str
    system_prompt: str | None = None


class ChatHistoryItem(BaseModel):
    id: int
    created_at: datetime
    user_message: str
    bot_reply: str
    topic: str | None = None
    emergency: bool = False


class ChatResponse(BaseModel):
    id: int
    patient_id: int
    reply: str
    topic: str | None = None
    emergency: bool = False
    created_at: datetime
    patient_summary: str


class NotifyRequest(BaseModel):
    message: str


class SymptomReportRequest(BaseModel):
    symptom_type: str
    description: str | None = None


class MedicationLogRequest(BaseModel):
    plan_id:   int
    med_index: int
    slot:      str        # e.g. '08:00'
    taken_date: str       # YYYY-MM-DD


# ── endpoints ────────────────────────────────────────────────────────────────

@router.post("/login")
def patient_login(body: PatientLoginRequest, db: Session = Depends(get_db)):
    lookup = body.hospital_id.strip()
    normalized = lookup.upper()

    query = db.query(Patient).filter(Patient.hospital_id == normalized)
    if lookup.isdigit():
        query = query.union_all(db.query(Patient).filter(Patient.id == int(lookup)))

    patient = query.first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")

    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient.id).first()
    if enrollment:
        changed = False
        if not enrollment.first_login_at:
            enrollment.first_login_at = datetime.now(timezone.utc)
            if enrollment.status == "sent":
                enrollment.status = "active"
            changed = True
        if body.language and body.language in ("en", "si", "ta"):
            enrollment.preferred_language = body.language
            changed = True
        if changed:
            db.commit()

    return {
        "token":   _create_mobile_token(patient.id, "patient"),
        "patient": _patient_payload(patient),
    }


@router.post("/caretaker-login")
def caretaker_login(body: CaretakerLoginRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.hospital_id == body.hospital_id.strip().upper()
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")

    caretaker = db.query(Caretaker).filter(
        Caretaker.patient_id == patient.id,
        Caretaker.phone == body.phone.strip(),
    ).first()
    if not caretaker:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Caretaker not registered")

    return {
        "token":     _create_mobile_token(patient.id, "caretaker"),
        "patient":   _patient_payload(patient),
        "caretaker": {
            "id":           caretaker.id,
            "name":         caretaker.name,
            "relation": caretaker.relation,
        },
    }


@router.get("/checkins/latest", response_model=CheckInResponse | None)
def latest_checkin(
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    latest = (
        db.query(CheckIn)
        .filter(CheckIn.patient_id == patient.id)
        .order_by(CheckIn.id.desc())
        .first()
    )
    if not latest:
        return None
    return CheckInResponse(
        id=latest.id,
        patient_id=patient.id,
        patient_name=patient.name,
        hospital_id=patient.hospital_id,
        submitted_by_role=latest.submitted_by_role,
        trigger_source=latest.trigger_source,
        reminder_frequency=latest.reminder_frequency,
        headache=latest.headache,
        seizure=latest.seizure,
        energy=latest.energy,
        nausea=latest.nausea,
        medication=latest.medication,
        overall=latest.overall,
        sleep=latest.sleep,
        appetite=latest.appetite,
        note=latest.note,
        score=latest.score,
        level=latest.level,
        emergency=latest.emergency,
        created_at=latest.created_at,
        message=_derive_level(latest.score, latest.seizure)[2],
    )


@router.get("/checkins")
def checkin_history(
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    rows = (
        db.query(CheckIn)
        .filter(CheckIn.patient_id == patient.id)
        .order_by(CheckIn.id.desc())
        .all()
    )
    return [
        {
            "id": row.id,
            "created_at": row.created_at,
            "score": row.score,
            "level": row.level,
            "emergency": row.emergency,
            "trigger_source": row.trigger_source,
        }
        for row in rows
    ]


@router.post("/checkins", response_model=CheckInResponse)
def submit_checkin(
    body: CheckInCreateRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, role = auth

    scoring = {
        "headache": {
            "No headache": 0,
            "Mild (a little)": 1,
            "Moderate (painful)": 2,
            "Severe (very bad)": 3,
        },
        "seizure": {
            "No": 0,
            "Yes (brief)": 5,
            "Yes (long)": 5,
        },
        "energy": {
            "Normal": 0,
            "A bit tired": 1,
            "Very tired": 2,
            "Cannot get up": 3,
        },
        "nausea": {
            "None": 0,
            "Feeling sick": 1,
            "Vomited once": 2,
            "Vomited many times": 3,
        },
        "medication": {
            "Yes (all doses)": 0,
            "Missed one dose": 1,
            "Missed all doses": 2,
            "No medication today": 0,
        },
        "overall": {
            "Good": 0,
            "Same as usual": 1,
            "Worse than yesterday": 2,
            "Much worse": 3,
        },
        "sleep": {
            "Well": 0,
            "Okay": 1,
            "Poor": 2,
            "Very little": 3,
        },
        "appetite": {
            "Normal": 0,
            "Slightly low": 1,
            "Very low": 2,
            "Could not eat": 3,
        },
    }

    score = sum(
        _score_answer(getattr(body, field), scoring[field])
        for field in ["headache", "seizure", "energy", "nausea", "medication", "overall", "sleep", "appetite"]
    )
    level, emergency, message = _derive_level(score, body.seizure)

    checkin = CheckIn(
        patient_id=patient.id,
        submitted_by_role=role,
        trigger_source=body.trigger_source or 'Patient taps "Daily Check-in"',
        reminder_frequency=_monitoring_frequency(patient.tumour_type),
        headache=body.headache,
        seizure=body.seizure,
        energy=body.energy,
        nausea=body.nausea,
        medication=body.medication,
        overall=body.overall,
        sleep=body.sleep,
        appetite=body.appetite,
        note=(body.note or "").strip() or None,
        score=score,
        level=level,
        emergency=emergency,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)

    return CheckInResponse(
        id=checkin.id,
        patient_id=patient.id,
        patient_name=patient.name,
        hospital_id=patient.hospital_id,
        submitted_by_role=checkin.submitted_by_role,
        trigger_source=checkin.trigger_source,
        reminder_frequency=checkin.reminder_frequency,
        headache=checkin.headache,
        seizure=checkin.seizure,
        energy=checkin.energy,
        nausea=checkin.nausea,
        medication=checkin.medication,
        overall=checkin.overall,
        sleep=checkin.sleep,
        appetite=checkin.appetite,
        note=checkin.note,
        score=checkin.score,
        level=checkin.level,
        emergency=checkin.emergency,
        created_at=checkin.created_at,
        message=message,
    )



@router.post("/notify")
def notify_clinician(
    body: NotifyRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    """Persist a lightweight clinician alert (dev).

    This endpoint records an emergency chat message and returns success.
    In production this should trigger email/push notifications to the assigned clinician.
    """
    patient, _role = auth
    message = (body.message or "").strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message is required")

    chat = ChatMessage(
        patient_id=patient.id,
        user_message=message,
        bot_reply="Clinician notified (dev)",
        emergency=True,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return {"notified": True, "id": chat.id, "message": "Clinician notified (dev)"}


class PreferencesRequest(BaseModel):
    language: str
    reminder_time: str | None = None


@router.post("/language")
def save_preferences(
    body: PreferencesRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    lang = body.language.strip()
    if lang not in ("en", "si", "ta"):
        return {"ok": False}
    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient.id).first()
    if enrollment:
        enrollment.preferred_language = lang
        enrollment.last_active_at = datetime.now(timezone.utc)
        if body.reminder_time:
            enrollment.reminder_time = body.reminder_time
        db.commit()
    return {"ok": True}


@router.post("/symptom-report")
def report_symptom(
    body: SymptomReportRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    """Store a non-emergency irregular symptom reported by the patient."""
    patient, _role = auth
    symptom_type = (body.symptom_type or "").strip()
    if not symptom_type:
        from fastapi import HTTPException as _H
        raise _H(status_code=400, detail="symptom_type is required")

    parts = [f"New symptom: {symptom_type}"]
    if body.description and body.description.strip():
        parts.append(f"Details: {body.description.strip()}")

    chat = ChatMessage(
        patient_id=patient.id,
        user_message=" | ".join(parts),
        bot_reply="Received by care team",
        topic="symptom_report",
        emergency=False,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {"saved": True, "id": chat.id}


@router.get("/chat/history", response_model=list[ChatHistoryItem])
def chat_history(
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.patient_id == patient.id)
        .order_by(ChatMessage.id.asc())
        .all()
    )
    return [
        ChatHistoryItem(
            id=row.id,
            created_at=row.created_at,
            user_message=row.user_message,
            bot_reply=row.bot_reply,
            topic=row.topic,
            emergency=row.emergency,
        )
        for row in rows
    ]


@router.get("/report")
def patient_report(
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient.id).first()
    if enrollment:
        enrollment.last_active_at = datetime.now(timezone.utc)
        db.commit()
    latest_result = _latest_result(db, patient.id)
    # Fetch all plans (not just latest 3) so the patient sees every care plan including older medication plans
    plans = (
        db.query(TreatmentPlan)
        .filter(TreatmentPlan.patient_id == patient.id)
        .order_by(TreatmentPlan.id.desc())
        .all()
    )

    scan = None
    if latest_result:
        label = latest_result.confirmed_label or latest_result.predicted_label
        scan = {
            "ai_prediction":    latest_result.predicted_label,
            "confirmed_label":  latest_result.confirmed_label,
            "final_label":      label,
            "pathology_grade":  latest_result.pathology_grade,
            "confidence":       round((latest_result.confidence or 0) * 100, 1),
            "scanned_at":       latest_result.created_at.isoformat() if latest_result.created_at else None,
            "doctor_confirmed": latest_result.confirmed_label is not None,
        }

    return {
        "patient": _patient_payload(patient),
        "scan": scan,
        "treatment_plans": [
            {
                "id":               p.id,
                "title":            p.title,
                "plan_type":        p.plan_type,
                "medications":      p.medications,
                "therapy_schedule": p.therapy_schedule,
                "surgery_details":  p.surgery_details,
                "notes":            p.notes,
                "status":           p.status,
                "plan_date":        p.plan_date,
                "created_by_name":  p.created_by_name,
            }
            for p in plans
        ],
    }


class PatientSettingsRequest(BaseModel):
    tumour_type: str | None = None


@router.put("/patient")
def update_mobile_patient(
    body: PatientSettingsRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    """Allow mobile users to update limited patient settings (tumour_type).

    This endpoint updates only safe fields that patients can change from the mobile app.
    """
    patient, _role = auth
    updated = False
    if body.tumour_type is not None:
        patient.tumour_type = body.tumour_type.strip() or None
        updated = True

    if updated:
        db.add(patient)
        db.commit()
        db.refresh(patient)

    return _patient_payload(patient)


@router.post("/medication-log")
def log_medication(
    body: MedicationLogRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    """Record that the patient has taken a medication dose. Idempotent."""
    patient, _role = auth
    existing = (
        db.query(MedicationLog)
        .filter(
            MedicationLog.patient_id == patient.id,
            MedicationLog.plan_id    == body.plan_id,
            MedicationLog.med_index  == body.med_index,
            MedicationLog.slot       == body.slot,
            MedicationLog.taken_date == body.taken_date,
        )
        .first()
    )
    if not existing:
        db.add(MedicationLog(
            patient_id = patient.id,
            plan_id    = body.plan_id,
            med_index  = body.med_index,
            slot       = body.slot,
            taken_date = body.taken_date,
        ))
        db.commit()
    return {"ok": True}


@router.post("/chat", response_model=ChatResponse)
def chat_reply(
    body: ChatCreateRequest,
    auth: tuple[Patient, str] = Depends(get_mobile_patient),
    db: Session = Depends(get_db),
):
    patient, _role = auth
    message = (body.message or "").strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message is required")

    context = _patient_context(db, patient)
    language = _detect_language(message)
    reply, topic, emergency = _answer_chat(message, context, language)

    chat = ChatMessage(
        patient_id=patient.id,
        user_message=message,
        bot_reply=reply,
        topic=topic,
        emergency=emergency,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    summary_bits = [
        f"Diagnosis: {context['diagnosis']}",
        f"Plan: {context['plan_summary']}" if context["plan_summary"] else None,
        f"Doctor: {context['doctor']}" if context['doctor'] else None,
    ]
    return ChatResponse(
        id=chat.id,
        patient_id=patient.id,
        reply=reply,
        topic=topic,
        emergency=emergency,
        created_at=chat.created_at,
        patient_summary=_safe_join(summary_bits, " | "),
    )
