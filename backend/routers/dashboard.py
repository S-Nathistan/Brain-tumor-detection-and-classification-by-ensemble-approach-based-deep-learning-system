import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, exists, and_
from datetime import datetime, timedelta, date

from backend.db.database import get_db
from backend.models.user import User
from backend.models.result import Result
from backend.models.chat_message import ChatMessage
from backend.core.security import get_current_active_user, require_admin
# Database Models (Nirojini's addition)
from backend.models.patient import Patient
from backend.models.audit_log import AuditLog
from backend.models.admission import Admission
from backend.models.medication_log import MedicationLog
from backend.routers.treatment_plans import TreatmentPlan

# API Routers (Shameeha's addition)
from backend.routers import auth, results, patients, dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"]) 


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Total users breakdown
    total_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    total_users_by_role = {role: count for role, count in total_counts}
    
    since = datetime.utcnow() - timedelta(hours=24)

    # For clinicians scope everything to their assigned patients
    is_clinician = current_user.role == "Clinician"
    patient_filter = (Patient.assigned_doctor_id == current_user.id) if is_clinician else True

    # Medical breakdown
    total_patients = db.query(func.count(Patient.id)).filter(patient_filter).scalar() or 0

    has_active_admission = exists().where(
        and_(Admission.patient_id == Patient.id, Admission.status == "Active")
    )
    has_any_admission = exists().where(Admission.patient_id == Patient.id)
    active_patients = db.query(func.count(Patient.id)).filter(
        patient_filter,
        has_active_admission | (~has_any_admission & (Patient.discharge_date == "Pending"))
    ).scalar() or 0

    total_scans = (
        db.query(func.count(Result.id))
        .join(Patient, Result.patient_id == Patient.id)
        .filter(patient_filter)
        .scalar() or 0
    )
    uploads_24h = (
        db.query(func.count(Result.id))
        .join(Patient, Result.patient_id == Patient.id)
        .filter(patient_filter, Result.created_at >= since)
        .scalar() or 0
    )

    total_staff  = db.query(func.count(User.id)).scalar() or 0
    active_staff = db.query(func.count(User.id)).filter(User.status == True).scalar() or 0

    tumour_counts = (
        db.query(Patient.tumour_type, func.count(Patient.id))
        .filter(patient_filter)
        .group_by(Patient.tumour_type)
        .all()
    )
    tumour_breakdown = {t_type: count for t_type, count in tumour_counts if t_type}

    return {
        "total_users":    total_users_by_role,
        "uploads_24h":    uploads_24h,
        "total_patients": total_patients,
        "active_patients": active_patients,
        "total_scans":    total_scans,
        "total_staff":    total_staff,
        "active_staff":   active_staff,
        "tumour_breakdown": tumour_breakdown,
    }


@router.get("/audit-logs")
def audit_logs(limit: int = 10, status: str = None, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):

    query = db.query(AuditLog)
    if status and status != "All":
        query = query.filter(AuditLog.status == status)
    
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    # Return in format frontend expects
    return [{
        "id": l.id,
        "action": l.action,
        "user": l.user,
        "role": l.role,
        "ip": l.ip,
        "status": l.status,
        "timestamp": l.timestamp.isoformat(),
        "details": l.details,
        "message": f"{l.user}: {l.action}" # Legacy support
    } for l in logs]


@router.get("/user-roles")
def user_roles(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):

    role_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    return [{"role": role, "count": count} for role, count in role_counts]


@router.get("/worklist")
def worklist(limit: int = 15, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    q = db.query(Patient)
    if current_user.role == "Clinician":
        q = q.filter(Patient.assigned_doctor_id == current_user.id)
    patients = q.order_by(Patient.updated_at.desc()).limit(limit).all()

    patient_ids = [p.id for p in patients]

    # Latest result per patient
    latest_result_subq = (
        db.query(Result.patient_id, func.max(Result.id).label("max_id"))
        .filter(Result.patient_id.in_(patient_ids))
        .group_by(Result.patient_id)
        .subquery()
    )
    results_map = {
        r.patient_id: r
        for r in db.query(Result).join(
            latest_result_subq,
            and_(Result.patient_id == latest_result_subq.c.patient_id,
                 Result.id == latest_result_subq.c.max_id)
        ).all()
    }

    # Latest admission per patient
    latest_adm_subq = (
        db.query(Admission.patient_id, func.max(Admission.id).label("max_id"))
        .filter(Admission.patient_id.in_(patient_ids))
        .group_by(Admission.patient_id)
        .subquery()
    )
    admission_map = {
        a.patient_id: a
        for a in db.query(Admission).join(
            latest_adm_subq,
            and_(Admission.patient_id == latest_adm_subq.c.patient_id,
                 Admission.id == latest_adm_subq.c.max_id)
        ).all()
    }

    # Whether a treatment plan exists per patient
    plan_map = {
        row[0]: row[1]
        for row in db.query(TreatmentPlan.patient_id, func.max(TreatmentPlan.status))
        .filter(TreatmentPlan.patient_id.in_(patient_ids))
        .group_by(TreatmentPlan.patient_id)
        .all()
    }

    rows = []
    for p in patients:
        result = results_map.get(p.id)
        admission = admission_map.get(p.id)
        plan_status = plan_map.get(p.id)

        if result is None:
            scan_status = "No Scan"
        elif result.confirmed_label:
            scan_status = "Confirmed"
        else:
            scan_status = "Pending"

        rows.append({
            "patient_id":    p.id,
            "hospital_id":   p.hospital_id,
            "name":          p.name,
            "tumour_type":   p.tumour_type or "Not Classified",
            "scan_status":   scan_status,
            "plan_status":   plan_status or "No Plan",
            "admission_status": admission.status if admission else "Not Admitted",
            "updated_at":    p.updated_at.isoformat() if p.updated_at else None,
        })

    return rows


@router.get("/patient-alerts")
def patient_alerts(limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    q = (
        db.query(ChatMessage, Patient)
        .join(Patient, ChatMessage.patient_id == Patient.id)
        .filter(ChatMessage.emergency == True)
    )

    if current_user.role == "Clinician":
        q = q.filter(Patient.assigned_doctor_id == current_user.id)

    rows = q.order_by(ChatMessage.created_at.desc()).limit(limit).all()

    alerts = []
    for message, patient in rows:
        alerts.append({
            "id": message.id,
            "patient_id": patient.id,
            "hospital_id": patient.hospital_id,
            "patient_name": patient.name,
            "doctor_name": patient.clinician.name if patient.clinician else None,
            "message": message.user_message,
            "reply": message.bot_reply,
            "topic": message.topic,
            "created_at": message.created_at.isoformat() if message.created_at else None,
            "emergency": bool(message.emergency),
            "acknowledged_by_name": message.acknowledger.name if message.acknowledger else None,
            "acknowledged_at": message.acknowledged_at.isoformat() if message.acknowledged_at else None,
        })

    return alerts


@router.patch("/patient-alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    from datetime import datetime, timezone
    message = db.query(ChatMessage).filter(ChatMessage.id == alert_id, ChatMessage.emergency == True).first()
    if not message:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    message.acknowledged_by = current_user.id
    message.acknowledged_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "id": message.id,
        "acknowledged_by_name": current_user.name,
        "acknowledged_at": message.acknowledged_at.isoformat(),
    }


@router.get("/symptom-reports/{patient_id}")
def symptom_reports(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    rows = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.patient_id == patient_id,
            ChatMessage.topic == "symptom_report",
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": r.id,
            "message": r.user_message,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/medication-adherence/{patient_id}")
def medication_adherence(
    patient_id: int,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return medication plans and taken logs for the last N days for a patient."""
    since_date = (date.today() - timedelta(days=days - 1)).isoformat()

    plans = (
        db.query(TreatmentPlan)
        .filter(
            TreatmentPlan.patient_id == patient_id,
            TreatmentPlan.medications.isnot(None),
            TreatmentPlan.medications != "",
        )
        .order_by(TreatmentPlan.id.desc())
        .all()
    )

    medications = []
    for plan in plans:
        raw = plan.medications or ""
        try:
            items = json.loads(raw)
            if not isinstance(items, list):
                continue
        except Exception:
            continue
        for idx, med in enumerate(items):
            if not isinstance(med, dict) or not med.get("name"):
                continue
            medications.append({
                "plan_id":    plan.id,
                "plan_title": plan.title or "Care Plan",
                "med_index":  idx,
                "name":       med.get("name", ""),
                "dosage":     med.get("dosage", ""),
                "slots":      med.get("times", []),
                "food":       med.get("food", ""),
            })

    logs = (
        db.query(MedicationLog)
        .filter(
            MedicationLog.patient_id == patient_id,
            MedicationLog.taken_date >= since_date,
        )
        .order_by(MedicationLog.taken_date.asc())
        .all()
    )

    return {
        "medications": medications,
        "logs": [
            {
                "plan_id":    log.plan_id,
                "med_index":  log.med_index,
                "slot":       log.slot,
                "taken_date": log.taken_date,
                "taken_at":   log.taken_at.isoformat() if log.taken_at else None,
            }
            for log in logs
        ],
        "days": days,
        "since": since_date,
    }
