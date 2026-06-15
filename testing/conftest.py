"""Shared fixtures + config for the NeuroSight backend test suite.

The suite runs against a LIVE backend (default http://localhost:8000). Token
fixtures log in once per session via POST /auth/login (sync httpx.Client) so the
new login rate limiter is not tripped; the test bodies themselves use
httpx.AsyncClient as required.

Credentials are taken from environment variables, falling back to the seeded
Super Admin (backend/seed_admin.py). Provide real Clinician / Assistant accounts
to exercise the RBAC cases; tests that need a missing role are skipped, not failed.

    NS_BASE_URL            default http://localhost:8000
    NS_SUPERADMIN_EMAIL    default admin@neurosight.ai
    NS_SUPERADMIN_PASSWORD default admin123
    NS_ADMIN_EMAIL         default = superadmin email
    NS_ADMIN_PASSWORD      default = superadmin password
    NS_CLINICIAN_EMAIL / NS_CLINICIAN_PASSWORD   (no default → role tests skip)
    NS_ASSISTANT_EMAIL / NS_ASSISTANT_PASSWORD   (no default → role tests skip)
    RUN_MODEL=1            opt in to slow inference tests
    RUN_DESTRUCTIVE=1      opt in to destructive (delete) tests
"""

import os
import uuid

import httpx
import pytest
import pytest_asyncio


def _load_env_test() -> None:
    """Load testing/.env.test into os.environ (without overriding values already
    set in the real environment). Minimal parser — no python-dotenv dependency."""
    path = os.path.join(os.path.dirname(__file__), ".env.test")
    try:
        with open(path, encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key, value = key.strip(), value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


_load_env_test()

BASE_URL = os.getenv("NS_BASE_URL", "http://localhost:8000").rstrip("/")

_SUPER_EMAIL = os.getenv("NS_SUPERADMIN_EMAIL", "admin@neurosight.ai")
_SUPER_PASS = os.getenv("NS_SUPERADMIN_PASSWORD", "admin123")

CREDENTIALS = {
    "superadmin": (_SUPER_EMAIL, _SUPER_PASS),
    # require_admin accepts Super Admin too, so the seeded account covers admin-only routes.
    "admin": (os.getenv("NS_ADMIN_EMAIL", _SUPER_EMAIL), os.getenv("NS_ADMIN_PASSWORD", _SUPER_PASS)),
    "clinician": (os.getenv("NS_CLINICIAN_EMAIL"), os.getenv("NS_CLINICIAN_PASSWORD")),
    "assistant": (os.getenv("NS_ASSISTANT_EMAIL"), os.getenv("NS_ASSISTANT_PASSWORD")),
}


def bearer(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── one-time, synchronous login helpers ──────────────────────────────────────

@pytest.fixture(scope="session")
def sync_client():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as c:
        yield c


def _login(client: httpx.Client, email: str | None, password: str | None) -> str | None:
    if not email or not password:
        return None
    try:
        r = client.post("/auth/login", json={"email": email, "password": password})
    except httpx.HTTPError:
        return None
    if r.status_code == 200:
        return r.json().get("access_token")
    return None


def _token_fixture(role: str):
    @pytest.fixture(scope="session")
    def _fixture(sync_client):
        email, password = CREDENTIALS[role]
        token = _login(sync_client, email, password)
        if not token:
            pytest.skip(
                f"No working {role} login (set NS_{role.upper()}_EMAIL / "
                f"NS_{role.upper()}_PASSWORD, and ensure backend is running at {BASE_URL})"
            )
        return token
    return _fixture


superadmin_token = _token_fixture("superadmin")
admin_token = _token_fixture("admin")
clinician_token = _token_fixture("clinician")
assistant_token = _token_fixture("assistant")


@pytest.fixture(scope="session")
def admin_user(sync_client, admin_token):
    """The admin's own /auth/me record — used for self-action and id-collision tests."""
    r = sync_client.get("/auth/me", headers=bearer(admin_token))
    if r.status_code != 200:
        pytest.skip("Could not read admin /auth/me")
    return r.json()


# ── per-test async client (all HTTP assertions go through this) ───────────────

@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=120.0) as c:
        yield c


# ── secret key (for crafting expired / forged tokens) ────────────────────────

@pytest.fixture(scope="session")
def secret_key():
    key = os.getenv("SECRET_KEY")
    if key:
        return key
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env")
    try:
        with open(env_path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("SECRET_KEY="):
                    return line.split("=", 1)[1].strip()
    except OSError:
        pass
    pytest.skip("SECRET_KEY not available (set env SECRET_KEY or backend/.env) — cannot craft signed tokens")


# ── a real patient to target for upload / result tests ───────────────────────

@pytest.fixture(scope="session")
def patient(sync_client, admin_token):
    r = sync_client.get("/patients", headers=bearer(admin_token))
    if r.status_code != 200 or not r.json():
        pytest.skip("No patients exist to target (seed at least one patient)")
    p = r.json()[0]
    return {"id": p["id"], "hospital_id": p.get("hospital_id")}


# ── ephemeral active user (known password) — created + torn down per test ─────

@pytest.fixture
def ephemeral_user(sync_client, admin_token):
    email = f"qa_{uuid.uuid4().hex[:12]}@example.com"
    password = "QaUserPass123!"
    body = {"email": email, "password": password, "name": "QA Ephemeral",
            "role": "Clinician", "status": True}
    r = sync_client.post("/auth/register", json=body, headers=bearer(admin_token))
    if r.status_code not in (200, 201):
        pytest.skip(f"Could not create ephemeral user (register returned {r.status_code})")
    uid = r.json()["id"]
    token = _login(sync_client, email, password)
    yield {"id": uid, "email": email, "password": password, "token": token}
    sync_client.delete(f"/auth/users/{uid}", headers=bearer(admin_token))


# ── ephemeral patient (throwaway) for destructive RBAC delete test ───────────

@pytest.fixture
def ephemeral_patient(sync_client, admin_token):
    hosp = f"QA-{uuid.uuid4().hex[:8].upper()}"
    body = {"hospital_id": hosp, "name": "QA Throwaway Patient"}
    r = sync_client.post("/patients", json=body, headers=bearer(admin_token))
    if r.status_code not in (200, 201):
        pytest.skip(f"Could not create ephemeral patient (returned {r.status_code})")
    pid = r.json()["id"]
    yield {"id": pid, "hospital_id": hosp}
    # best-effort cleanup if the test did not delete it
    sync_client.delete(f"/patients/{pid}", headers=bearer(admin_token))


# ── helper: mint a real password-reset token in-process (for set-password) ───

def mint_reset_token(email: str) -> str | None:
    """Generate a valid reset token via backend internals. Returns None if the
    backend package / DB cannot be imported from the test environment."""
    try:
        from backend.db.database import SessionLocal
        from backend.models.user import User
        from backend.core.email_utils import create_password_reset_token
    except Exception:
        return None
    try:
        db = SessionLocal()
    except Exception:
        return None
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        return create_password_reset_token(db, user)
    except Exception:
        return None
    finally:
        db.close()
