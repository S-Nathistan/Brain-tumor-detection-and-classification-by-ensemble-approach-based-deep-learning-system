from pydantic_settings import BaseSettings

from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:4545@localhost:5432/brain_tumor"
    SECRET_KEY: str = "CHANGE_ME"              # use a strong random string
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent / "uploads")
    CORS_ORIGINS: str = "http://localhost:5173"
    
    # Email settings
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str = "noreply@neurosight.com"

    class Config:
        env_file = ".env"

settings = Settings()
