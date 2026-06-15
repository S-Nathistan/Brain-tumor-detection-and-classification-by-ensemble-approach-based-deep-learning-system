from pydantic_settings import BaseSettings, SettingsConfigDict

from pathlib import Path

DATABASE_URL_PLACEHOLDER = "postgresql+psycopg2://user:najma1234@localhost:5432/brain_tumor"
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"

# Former hard-coded fallback — anyone who has seen the repo can forge tokens
# signed with it, so startup must refuse it.
_INSECURE_DEFAULT_SECRET = "1234567890abcdef1234567890abcdef"

class Settings(BaseSettings):

    DATABASE_URL: str = DATABASE_URL_PLACEHOLDER

    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent / "uploads")
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
    
    # Blockchain / IPFS settings
    PINATA_API_KEY: str | None = None
    PINATA_SECRET_KEY: str | None = None
    ETH_PRIVATE_KEY: str | None = None
    FERNET_KEY: str | None = None          # generate once: Fernet.generate_key().decode()

    # Email settings
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_EMAIL: str = "noreply@neurosight.com"

    # Enrollment
    MOBILE_APP_URL: str = ""           # e.g. https://neurosight-mobile.vercel.app
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_PHONE_NUMBER: str | None = None

    model_config = SettingsConfigDict(env_file=str(ENV_FILE_PATH), extra="ignore")

    def model_post_init(self, __context):
        # Normalize postgresql:// / postgres:// → postgresql+psycopg2:// for SQLAlchemy
        if self.DATABASE_URL and self.DATABASE_URL.startswith('postgresql://'):
            object.__setattr__(self, 'DATABASE_URL', self.DATABASE_URL.replace('postgresql://', 'postgresql+psycopg2://', 1))
        elif self.DATABASE_URL and self.DATABASE_URL.startswith('postgres://'):
            object.__setattr__(self, 'DATABASE_URL', self.DATABASE_URL.replace('postgres://', 'postgresql+psycopg2://', 1))

        if not self.SECRET_KEY or self.SECRET_KEY == _INSECURE_DEFAULT_SECRET or len(self.SECRET_KEY) < 32:
            raise RuntimeError(
                "SECRET_KEY is missing, too short (<32 chars), or set to the known insecure default. "
                "Set a strong random value in backend/.env, e.g.: "
                "python -c \"import secrets; print(secrets.token_hex(32))\""
            )

settings = Settings()


def _parse_cors_origins(value: str | list[str] | None) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return [origin.strip() for origin in value if origin and origin.strip()]


CORS_ORIGINS = _parse_cors_origins(settings.CORS_ORIGINS)
