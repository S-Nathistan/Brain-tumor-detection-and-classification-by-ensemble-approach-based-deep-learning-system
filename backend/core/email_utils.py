import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.core.config import settings

def send_welcome_email(to_email: str, user_id: int, password: str):
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"SMTP not configured. Skipping email to {to_email}")
        print(f"Credentials - User ID: {user_id}, Password: {password}")
        return

    subject = "Welcome to NeuroSight - Your Login Credentials"
    login_url = f"{settings.CORS_ORIGINS}/"
    
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to NeuroSight!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>User ID:</strong> {user_id}</p>
            <p><strong>Password:</strong> {password}</p>
            <p>Please login at: <a href="{login_url}">{login_url}</a></p>
            <br>
            <p>Best regards,<br>NeuroSight Team</p>
        </body>
    </html>
    """

    msg = MIMEMultipart()
    msg["From"] = settings.EMAILS_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            print(f"Welcome email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
