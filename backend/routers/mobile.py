from datetime import datetime, timedelta
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
from backend.models.patient import Patient
from backend.models.result import Result
from backend.routers.treatment_plans import TreatmentPlan

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
        latest_scan = _safe_join([
            latest_result.predicted_label,
            f"confidence {latest_result.confidence:.1f}%" if latest_result.confidence is not None else None,
            f"grade {latest_result.pathology_grade}" if latest_result.pathology_grade else None,
        ])

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


def _answer_chat(message: str, context: dict) -> tuple[str, str, bool]:
    lowered = message.lower().strip()
    latest_checkin = context.get("latest_checkin")

    if _has_emergency_language(lowered):
        return (
            "This sounds urgent. Call 1990 now or go to the nearest hospital right away.",
            "emergency",
            True,
        )

    if any(keyword in lowered for keyword in ["glioma", "tumour", "tumor", "diagnosis", "what do i have"]):
        reply = _safe_join([
            f"Your record shows {context['diagnosis']}.",
            f"Your latest plan is {context['plan_summary']}" if context["plan_summary"] else None,
            "Please ask your doctor to explain what this means for you personally.",
        ], " ")
        return reply, "diagnosis", False

    if any(keyword in lowered for keyword in ["chemo", "chemotherapy", "side effects", "side effect"]):
        reply = _safe_join([
            "Common treatment side effects can include tiredness, nausea, poor appetite, and headache.",
            f"Your current plan mentions {context['plan_summary']}" if context["plan_summary"] else None,
            "Always ask your doctor before changing any medicine or dose.",
        ], " ")
        return reply, "treatment", False

    if any(keyword in lowered for keyword in ["hospital", "go to hospital", "when should i go", "emergency", "worse"]):
        reply = _safe_join([
            "Go to hospital right away if you have a seizure, repeated vomiting, severe headache, confusion, weakness, trouble breathing, or a sudden change that worries you.",
            f"Your latest check-in shows {context['checkin_info']}" if context["checkin_info"] else None,
            "If you feel worse now, call 1990.",
        ], " ")
        return reply, "emergency", True

    if any(keyword in lowered for keyword in ["eat", "food", "diet", "eat should", "what should i eat"]):
        reply = _safe_join([
            "Small meals, water, and soft foods are often easier when appetite is low.",
            "Protein-rich foods can help if you can tolerate them, but avoid anything that makes nausea worse.",
            "If symptoms continue, your doctor or dietitian should guide you.",
        ], " ")
        return reply, "nutrition", False

    if any(keyword in lowered for keyword in ["pain", "hurt", "aching", "headache", "hip"]):
        reply = _safe_join([
            "Pain that is severe or getting worse should be reported to your care team.",
            f"Your record shows {context['diagnosis']} and the latest treatment plan is {context['plan_summary']}" if context["plan_summary"] else f"Your record shows {context['diagnosis']}.",
            "Please use the report symptom flow or contact your doctor.",
        ], " ")
        return reply, "symptom", False

    reply = _safe_join([
        f"Based on your record, your diagnosis is {context['diagnosis']}.",
        f"Your current treatment plan is {context['plan_summary']}" if context["plan_summary"] else "No treatment plan is recorded yet.",
        f"Your assigned doctor is {context['doctor']}." if context['doctor'] else "Please confirm the next step with your doctor.",
    ], " ")
    if latest_checkin and latest_checkin.level in {"RED", "CRITICAL"}:
        reply = _safe_join([reply, f"Your latest check-in was {latest_checkin.level.lower()} with score {latest_checkin.score}."], " ")
    reply = _safe_join([reply, "Please ask your doctor to confirm important treatment decisions."], " ")
    return reply, "general", False


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


# ── endpoints ────────────────────────────────────────────────────────────────

@router.post("/login")
def patient_login(body: PatientLoginRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.hospital_id == body.hospital_id.strip().upper()
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")

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
            "Mild — a little": 1,
            "Moderate — painful": 2,
            "Severe — very bad": 3,
        },
        "seizure": {
            "No": 0,
            "Yes — brief": 5,
            "Yes — long time": 5,
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
            "Yes — all doses": 0,
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
    }

    score = sum(
        _score_answer(getattr(body, field), scoring[field])
        for field in ["headache", "seizure", "energy", "nausea", "medication", "overall"]
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
        note=checkin.note,
        score=checkin.score,
        level=checkin.level,
        emergency=checkin.emergency,
        created_at=checkin.created_at,
        message=message,
    )


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
    reply, topic, emergency = _answer_chat(message, context)

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
