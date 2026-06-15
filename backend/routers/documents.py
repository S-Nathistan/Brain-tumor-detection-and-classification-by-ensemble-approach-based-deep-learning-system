from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String
import os
import uuid
from datetime import date

from backend.db.database import Base, get_db
from backend.core.security import get_current_active_user
from backend.models.patient import Patient
from backend.models.user import User

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    admission_id = Column(Integer, nullable=True)
    original_name = Column(String)
    saved_name = Column(String)
    doc_type = Column(String)
    description = Column(String, nullable=True)
    upload_date = Column(String)

router = APIRouter(prefix="/documents", tags=["documents"])

DOCS_DIR = "uploaded_docs"
os.makedirs(DOCS_DIR, exist_ok=True)

# Clinical documents: reports, referrals, scans-as-PDF. Executables/HTML/scripts
# must never land in a directory served back to browsers.
ALLOWED_DOC_EXTS = {"pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "txt"}
MAX_DOC_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB


@router.post("/upload")
async def upload_document(
    patient_id: int = Form(...),
    admission_id: Optional[int] = Form(None),
    doc_type: str = Form("Clinical Report"),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not db.query(Patient).filter(Patient.id == patient_id).first():
        raise HTTPException(status_code=404, detail="Patient not found")

    file_ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    if file_ext not in ALLOWED_DOC_EXTS:
        allowed = ", ".join(sorted(ALLOWED_DOC_EXTS))
        raise HTTPException(status_code=400, detail=f"Unsupported document type. Allowed: {allowed}")

    safe_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(DOCS_DIR, safe_name)

    written = 0
    try:
        with open(file_path, "wb") as buffer:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                written += len(chunk)
                if written > MAX_DOC_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum upload size is {MAX_DOC_UPLOAD_BYTES // (1024 * 1024)} MB.",
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    new_doc = Document(
        patient_id=patient_id,
        admission_id=admission_id,
        original_name=file.filename,
        saved_name=safe_name,
        doc_type=doc_type,
        description=description,
        upload_date=date.today().isoformat()
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.get("/patient/{patient_id}")
def get_patient_docs(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return db.query(Document).filter(Document.patient_id == patient_id).order_by(Document.id.desc()).all()

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        try:
            os.remove(os.path.join(DOCS_DIR, doc.saved_name))
        except FileNotFoundError:
            pass
        db.delete(doc)
        db.commit()
    return {"message": "Document deleted successfully"}