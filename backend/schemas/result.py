from pydantic import BaseModel

class ResultRead(BaseModel):
    id: int
    filename: str
    predicted_label: str
    confidence: float
    class Config:
        from_attributes = True
