from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String
import os
import uuid
import shutil
from datetime import date

from backend.db.database import Base, get_db

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True) # <-- Fixed!
    patient_id = Column(Integer, index=True)
    original_name = Column(String)
    saved_name = Column(String)
    doc_type = Column(String)
    upload_date = Column(String)

router = APIRouter(prefix="/documents", tags=["documents"])

DOCS_DIR = "uploaded_docs"
os.makedirs(DOCS_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    patient_id: int = Form(...),
    doc_type: str = Form("Clinical Report"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_ext = file.filename.split(".")[-1]
    safe_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(DOCS_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = Document(
        patient_id=patient_id,
        original_name=file.filename,
        saved_name=safe_name,
        doc_type=doc_type,
        upload_date=date.today().isoformat()
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.get("/patient/{patient_id}")
def get_patient_docs(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.patient_id == patient_id).order_by(Document.id.desc()).all()

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        try:
            os.remove(os.path.join(DOCS_DIR, doc.saved_name))
        except FileNotFoundError:
            pass
        db.delete(doc)
        db.commit()
    return {"message": "Document deleted successfully"}