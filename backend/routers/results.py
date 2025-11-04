from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Header
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from backend.db.database import get_db
from backend.core.config import settings
from backend.core.detector import predict
from backend.models.user import User
from backend.models.result import Result
from backend.schemas.result import ResultRead
from jose import jwt

router = APIRouter(prefix="/results", tags=["results"])

def get_user_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split()[1]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return int(payload.get("sub"))

@router.post("/upload", response_model=ResultRead)
def upload_scan(file: UploadFile = File(...), db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    uploads = Path(settings.UPLOAD_DIR)
    uploads.mkdir(parents=True, exist_ok=True)

    # Save file
    dst = uploads / file.filename
    with dst.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    # Run prediction
    label, conf = predict(str(dst))

    # Persist result
    result = Result(user_id=user_id, filename=str(dst), predicted_label=label, confidence=conf)
    db.add(result); db.commit(); db.refresh(result)
    return result

@router.get("/", response_model=list[ResultRead])
def list_results(db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    return db.query(Result).filter(Result.user_id == user_id).order_by(Result.id.desc()).all()

@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_user_id)):
    r = db.query(Result).filter(Result.id == result_id, Result.user_id == user_id).first()
    if not r: raise HTTPException(status_code=404, detail="Not found")
    return r
