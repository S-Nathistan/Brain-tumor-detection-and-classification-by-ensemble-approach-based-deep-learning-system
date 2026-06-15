import smtplib
import secrets
from datetime import datetime, timedelta, timezone
import hashlib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.models.user import User


logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_password_reset_token(db: Session, user: User, expires_minutes: int = 60) -> str:
    token = secrets.token_urlsafe(32)
    user.password_reset_token_hash = _hash_token(token)
    user.password_reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    db.add(user)
    db.commit()
    db.refresh(user)
    return token


def get_user_by_password_reset_token(db: Session, token: str) -> User | None:
    hashed = _hash_token(token)
    user = db.query(User).filter(User.password_reset_token_hash == hashed).first()
    if not user:
        return None
    if not user.password_reset_token_expires_at:
        return None
    if user.password_reset_token_expires_at < datetime.now(timezone.utc):
        return None
    return user


def send_email(to_email: str, subject: str, html_content: str):
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not configured; skipping email delivery to recipient=%s", to_email)
        return

    msg = MIMEMultipart()
    msg["From"] = settings.EMAILS_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)


def send_password_reset_email(to_email: str, reset_url: str):
    subject = "NeuroSight — Password Reset Request"
    html_content = f"""
    <html>
        <body style="font-family:Arial,sans-serif;color:#0f172a;">
            <h2 style="color:#0d9488;">NeuroSight Password Reset</h2>
            <p>We received a request to reset the password for your account.</p>
            <p>Click the link below to set a new password. This link expires in 60 minutes.</p>
            <p><a href="{reset_url}" style="color:#0d9488;">{reset_url}</a></p>
            <p>If you did not request a password reset, please ignore this email — your account remains secure.</p>
            <br>
            <p>NeuroSight Clinical Platform</p>
        </body>
    </html>
    """
    try:
        send_email(to_email, subject, html_content)
        logger.info("Password reset email dispatched to recipient=%s", to_email)
    except Exception as e:
        logger.warning("Failed to send password reset email to recipient=%s: %s", to_email, e)


def send_welcome_email(to_email: str, user_id: int, activation_url: str):
    subject = "Welcome to NeuroSight - Set Your Password"

    html_content = f"""
    <html>
        <body>
            <h2>Welcome to NeuroSight!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>User ID:</strong> {user_id}</p>
            <p>To activate your account, set your password using this secure one-time link:</p>
            <p><a href="{activation_url}">{activation_url}</a></p>
            <p>This link expires in 60 minutes.</p>
            <br>
            <p>Best regards,<br>NeuroSight Team</p>
        </body>
    </html>
    """

    try:
        send_email(to_email, subject, html_content)
        logger.info("Welcome email dispatched to recipient=%s", to_email)
    except Exception as e:
        logger.warning("Failed to send welcome email to recipient=%s: %s", to_email, e)
