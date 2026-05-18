from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, exists, and_
from datetime import datetime, timedelta

from backend.db.database import get_db
from backend.models.user import User
from backend.models.result import Result
from backend.core.security import get_current_active_user, require_admin
# Database Models (Nirojini's addition)
from backend.models.patient import Patient
from backend.models.audit_log import AuditLog
from backend.models.admission import Admission
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
