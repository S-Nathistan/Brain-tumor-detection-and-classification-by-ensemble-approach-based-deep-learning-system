import smtplib
import logging
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.db.database import get_db
from backend.models.enrollment import Enrollment
from backend.models.patient import Patient
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enrollment", tags=["enrollment"])

_TOKEN_DAYS = 7
_ALLOWED_ROLES = {"Doctor", "Clinician", "Super Admin", "Assistant"}


def _make_enrollment_token(patient_id: int, hospital_id: str) -> str:
    exp = datetime.utcnow() + timedelta(days=_TOKEN_DAYS)
    return jwt.encode(
        {"sub": str(patient_id), "hid": hospital_id, "type": "enrollment", "exp": exp},
        settings.SECRET_KEY, algorithm=settings.ALGORITHM,
    )


def _send_email(to: str, patient_name: str, link: str, hospital_id: str = "") -> bool:
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your NeuroSight app is ready"
        msg["From"] = settings.EMAILS_FROM_EMAIL
        msg["To"] = to
        html = f"""
        <html><body style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#0d9488">NeuroSight</h2>
          <p>Dear <strong>{patient_name}</strong>,</p>
          <p>Your NeuroSight care app is ready. Tap the button below to install it on your phone.</p>
          <a href="{link}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin:12px 0">
            Open NeuroSight App
          </a>
          <div style="margin:16px 0;padding:12px 18px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;display:inline-block">
            <p style="margin:0;font-size:12px;color:#0f766e;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Your Patient ID</p>
            <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#0d9488;letter-spacing:0.1em">{hospital_id}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#64748b">Enter this when signing in to the app</p>
          </div>
          <p style="color:#64748b;font-size:13px">This link expires in {_TOKEN_DAYS} days.<br>
          If you did not expect this message, please ignore it.</p>
        </body></html>"""
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as s:
            s.starttls()
            s.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            s.sendmail(settings.EMAILS_FROM_EMAIL, to, msg.as_string())
        return True
    except Exception as exc:
        logger.warning(f"Email send failed: {exc}")
        return False


def _send_sms(phone: str, link: str, hospital_id: str = "") -> bool:
    """Send SMS via Twilio if configured."""
    sid = getattr(settings, "TWILIO_ACCOUNT_SID", None)
    token = getattr(settings, "TWILIO_AUTH_TOKEN", None)
    from_num = getattr(settings, "TWILIO_PHONE_NUMBER", None)
    if not all([sid, token, from_num]):
        return False
    try:
        from twilio.rest import Client
        Client(sid, token).messages.create(
            body=(
                f"Your NeuroSight care app is ready.\n"
                f"Open: {link}\n"
                f"Your code: {hospital_id}"
            ),
            from_=from_num,
            to=phone,
        )
        return True
    except Exception as exc:
        logger.warning(f"SMS send failed: {exc}")
        return False


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/{patient_id}")
def enroll_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in _ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Not authorised to enroll patients")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    token = _make_enrollment_token(patient.id, patient.hospital_id)
    mobile_url = getattr(settings, "MOBILE_APP_URL", "").rstrip("/")
    link = f"{mobile_url}/?token={token}" if mobile_url else f"/?token={token}"

    # Upsert enrollment record
    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient_id).first()
    now = datetime.utcnow()
    if enrollment:
        enrollment.token = token
        enrollment.status = "sent"
        enrollment.enrolled_by_id = current_user.id
        enrollment.enrolled_at = now
        enrollment.sent_at = now
    else:
        enrollment = Enrollment(
            patient_id=patient_id,
            token=token,
            status="sent",
            enrolled_by_id=current_user.id,
            enrolled_at=now,
            sent_at=now,
        )
        db.add(enrollment)

    # Attempt delivery
    email_sent = _send_email(patient.email, patient.name, link, patient.hospital_id) if patient.email else False
    sms_sent = _send_sms(patient.phone, link, patient.hospital_id) if patient.phone else False

    if email_sent and sms_sent:
        enrollment.send_method = "both"
    elif email_sent:
        enrollment.send_method = "email"
    elif sms_sent:
        enrollment.send_method = "sms"
    else:
        enrollment.send_method = "none"

    db.commit()
    db.refresh(enrollment)

    return {
        "success": True,
        "link": link,
        "email_sent": email_sent,
        "sms_sent": sms_sent,
        "send_method": enrollment.send_method,
        "patient_name": patient.name,
        "hospital_id": patient.hospital_id,
    }


@router.get("/verify")
def verify_enrollment_token(token: str, db: Session = Depends(get_db)):
    """Called by the mobile app on load to validate an enrollment token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "enrollment":
            raise HTTPException(status_code=400, detail="Invalid token type")
        patient_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired enrollment token")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient_id).first()
    if enrollment and enrollment.status == "sent":
        enrollment.status = "active"
        if not enrollment.first_login_at:
            enrollment.first_login_at = datetime.now(timezone.utc)
        db.commit()

    return {
        "valid": True,
        "hospital_id": patient.hospital_id,
        "patient_name": patient.name,
        "has_caretakers": bool(patient.caretakers),
    }


@router.get("/")
def list_enrollments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """List all patient enrollments for the dashboard enrollment page."""
    if current_user.role not in _ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Not authorised")

    rows = db.query(Enrollment).order_by(Enrollment.enrolled_at.desc()).all()
    result = []
    for e in rows:
        p = e.patient
        result.append({
            "id": e.id,
            "patient_id": e.patient_id,
            "patient_name": p.name if p else "—",
            "hospital_id": p.hospital_id if p else "—",
            "phone": p.phone if p else None,
            "email": p.email if p else None,
            "status": e.status,
            "send_method": e.send_method,
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            "first_login_at": e.first_login_at.isoformat() if e.first_login_at else None,
            "enrolled_by": e.enrolled_by.name if e.enrolled_by else "—",
        })
    return result


@router.get("/{patient_id}/status")
def get_enrollment_status(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    enrollment = db.query(Enrollment).filter(Enrollment.patient_id == patient_id).first()
    if not enrollment:
        return {"enrolled": False, "status": None}
    return {
        "enrolled": True,
        "status": enrollment.status,
        "send_method": enrollment.send_method,
        "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
        "first_login_at": enrollment.first_login_at.isoformat() if enrollment.first_login_at else None,
        "last_active_at": enrollment.last_active_at.isoformat() if enrollment.last_active_at else None,
        "preferred_language": enrollment.preferred_language,
        "reminder_time": enrollment.reminder_time,
    }
