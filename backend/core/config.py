from pydantic_settings import BaseSettings

from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@localhost:5432/brain_tumor"
    SECRET_KEY: str = "CHANGE_ME"              # use a strong random string
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent / "uploads")
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
