from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    mobile: str | None = None
    role: str = "Clinician"
    status: bool = True
    department: str | None = None
    qualification: str | None = None
    license_number: str | None = None
    gender: str | None = None

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    mobile: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    name: str | None
    role: str
    mobile: str | None
    status: bool = True
    department: str | None = None
    qualification: str | None = None
    license_number: str | None = None
    gender: str | None = None
    profile_picture: str | None = None
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str | None = None
    mobile: str | None = None
    role: str | None = None
    status: bool | None = None
    department: str | None = None
    qualification: str | None = None
    license_number: str | None = None

class SelfUpdate(BaseModel):
    name: str | None = None
    mobile: str | None = None
    current_password: str | None = None
    new_password: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
