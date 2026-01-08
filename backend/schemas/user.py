from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    role: str = "Clinician"
    mobile: str | None = None

class UserRead(BaseModel):
    id: int
    email: EmailStr
    name: str | None
    role: str
    mobile: str | None
    status: bool = True
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str | None = None
    status: bool | None = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
