from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from backend.db.database import Base, get_db
from backend.core.security import get_current_active_user, require_roles
from backend.core.audit import log_event
from backend.models.user import User


class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True, nullable=False)
    admission_id = Column(Integer, nullable=True)    # links plan to a specific admission episode
    created_by = Column(Integer, nullable=True)      # user_id of the author
    created_by_name = Column(String(255), nullable=True)
    plan_date = Column(String(50), nullable=False)
    plan_type = Column(String(50), default="General")   # Medication | Therapy | Surgery | Observation | Follow-up
    title = Column(String(255), nullable=False)
    medications = Column(Text, nullable=True)
    therapy_schedule = Column(Text, nullable=True)
    surgery_details = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="Active")       # Active | Completed | Cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ── Pydantic schemas ────────────────────────────────────────────────
class TreatmentPlanCreate(BaseModel):
    patient_id: int
    admission_id: Optional[int] = None
    plan_date: str
    plan_type: str = "General"
    title: str
    medications: Optional[str] = None
    therapy_schedule: Optional[str] = None
    surgery_details: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Active"


class TreatmentPlanUpdate(BaseModel):
    plan_date: Optional[str] = None
    plan_type: Optional[str] = None
    title: Optional[str] = None
    medications: Optional[str] = None
    therapy_schedule: Optional[str] = None
    surgery_details: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class TreatmentPlanRead(BaseModel):
    id: int
    patient_id: int
    admission_id: Optional[int] = None
    created_by: Optional[int]
    created_by_name: Optional[str]
    plan_date: str
    plan_type: str
    title: str
    medications: Optional[str]
    therapy_schedule: Optional[str]
    surgery_details: Optional[str]
    notes: Optional[str]
    status: str

    class Config:
        from_attributes = True


# ── Router ──────────────────────────────────────────────────────────
router = APIRouter(
    prefix="/treatment-plans",
    tags=["treatment-plans"],
)


@router.post("", response_model=TreatmentPlanRead)
def create_plan(
    body: TreatmentPlanCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Clinician", "Admin", "Super Admin")),
):
    plan = TreatmentPlan(
        **body.model_dump(),
        created_by=current_user.id,
        created_by_name=current_user.name or current_user.email,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    log_event(db, "Treatment Plan Created", user_id=current_user.id,
              ip=request.client.host if request.client else "unknown",
              details=f"Plan '{plan.title}' for patient ID {plan.patient_id}")
    return plan


@router.get("/patient/{patient_id}", response_model=list[TreatmentPlanRead])
def get_plans_for_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(TreatmentPlan)
        .filter(TreatmentPlan.patient_id == patient_id)
        .order_by(TreatmentPlan.plan_date.desc(), TreatmentPlan.id.desc())
        .all()
    )


@router.get("/{plan_id}", response_model=TreatmentPlanRead)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    return plan


@router.put("/{plan_id}", response_model=TreatmentPlanRead)
def update_plan(
    plan_id: int,
    body: TreatmentPlanUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Clinician", "Admin", "Super Admin")),
):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    log_event(db, "Treatment Plan Updated", user_id=current_user.id,
              ip=request.client.host if request.client else "unknown",
              details=f"Plan ID {plan_id} updated")
    return plan


@router.delete("/{plan_id}", status_code=204)
def delete_plan(
    plan_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Clinician", "Admin", "Super Admin")),
):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Treatment plan not found")
    db.delete(plan)
    db.commit()
    log_event(db, "Treatment Plan Deleted", user_id=current_user.id,
              ip=request.client.host if request.client else "unknown",
              details=f"Plan ID {plan_id} deleted")
