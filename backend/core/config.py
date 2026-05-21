from pydantic_settings import BaseSettings, SettingsConfigDict

from pathlib import Path

DATABASE_URL_PLACEHOLDER = "postgresql+psycopg2://user:najma1234@localhost:5432/brain_tumor"
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"

class Settings(BaseSettings):

    DATABASE_URL: str = DATABASE_URL_PLACEHOLDER

    SECRET_KEY: str = "1234567890abcdef1234567890abcdef"              # use a strong random string
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

    model_config = SettingsConfigDict(env_file=str(ENV_FILE_PATH), extra="ignore")

    def model_post_init(self, __context):
        if not self.DATABASE_URL or self.DATABASE_URL == DATABASE_URL_PLACEHOLDER:
            raise ValueError("DATABASE_URL must be provided via environment and cannot use the placeholder value.")

settings = Settings()


def _parse_cors_origins(value: str | list[str] | None) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return [origin.strip() for origin in value if origin and origin.strip()]


CORS_ORIGINS = _parse_cors_origins(settings.CORS_ORIGINS)
