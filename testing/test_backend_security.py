"""
NeuroSight backend — security / functional test suite.

Covers Backend test cases from the QA test plan: AUTH-*, RBAC-*, UPL-*, DATA-*, API-*.

Conventions
-----------
* Each test function is named with its Test Case ID prefix (e.g. test_AUTH_01_...).
* HTTP calls use httpx.AsyncClient (the `client` fixture).
* Token fixtures (admin/clinician/assistant/superadmin) come from conftest and
  skip cleanly when the corresponding account isn't configured.
* Cases the plan marks "flag" / "document as defect" are wrapped in
  @pytest.mark.xfail (non-strict). NOTE: several of those defects were fixed in
  this branch (RBAC-05, UPL-04, UPL-10, UPL-11, API-01). Their xfail tests are
  expected to **XPASS** now — that XPASS is the signal the fix landed. The ones
  still open (AUTH-11, RBAC-06, API-02 load param) will XFAIL.

Run:
    cd testing
    pip install -r requirements-test.txt
    pytest                      # fast security/functional checks
    RUN_MODEL=1 pytest          # also run inference-dependent (slow) cases
    RUN_DESTRUCTIVE=1 pytest    # also run delete/cascade cases
"""

import base64
import json
import os
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from conftest import bearer, mint_reset_token

DEFAULT_INSECURE_SECRET = "1234567890abcdef1234567890abcdef"
RUN_MODEL = os.getenv("RUN_MODEL") == "1"
RUN_DESTRUCTIVE = os.getenv("RUN_DESTRUCTIVE") == "1"

# 1x1 PNG — valid container bytes (content-type acceptance; not a real MRI).
TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unverified_payload(token: str) -> dict:
    payload_seg = token.split(".")[1]
    payload_seg += "=" * (-len(payload_seg) % 4)
    return json.loads(base64.urlsafe_b64decode(payload_seg))


# =============================================================================
# AUTH
# =============================================================================

@pytest.mark.auth
async def test_AUTH_01_public_signup_blocked(client):
    r = await client.post("/auth/signup", json={"email": "x@y.test", "password": "p", "name": "n"})
    assert r.status_code == 403
    assert "disabled" in r.json()["detail"].lower()


@pytest.mark.auth
async def test_AUTH_02_only_admin_can_register(client, admin_token, clinician_token, assistant_token):
    email = f"qa_auth02_{uuid.uuid4().hex[:10]}@example.com"
    payload = {"email": email, "password": "TempPass123!", "name": "QA", "role": "Clinician", "status": True}

    assert (await client.post("/auth/register", json=payload, headers=bearer(clinician_token))).status_code == 403
    assert (await client.post("/auth/register", json=payload, headers=bearer(assistant_token))).status_code == 403

    r = await client.post("/auth/register", json=payload, headers=bearer(admin_token))
    # NB: route declares no status_code, so FastAPI returns 200 (plan said 201).
    assert r.status_code in (200, 201)
    created = r.json()
    assert created["email"] == email
    await client.delete(f"/auth/users/{created['id']}", headers=bearer(admin_token))


@pytest.mark.auth
async def test_AUTH_03_invalid_credentials_rejected(client, admin_user):
    for _ in range(3):
        r = await client.post("/auth/login", json={"email": admin_user["email"], "password": "definitely-wrong"})
        assert r.status_code == 401
        assert "invalid credentials" in r.json()["detail"].lower()
        assert "access_token" not in r.json()


@pytest.mark.auth
async def test_AUTH_04_deactivated_account_blocked(client, ephemeral_user, admin_token):
    token_before = ephemeral_user["token"]
    assert token_before, "ephemeral user should have logged in while active"

    # Deactivate
    r = await client.put(f"/auth/users/{ephemeral_user['id']}", json={"status": False}, headers=bearer(admin_token))
    assert r.status_code == 200

    # (a) login now refused
    r = await client.post("/auth/login", json={"email": ephemeral_user["email"], "password": ephemeral_user["password"]})
    assert r.status_code == 403
    assert "deactivated" in r.json()["detail"].lower()

    # (b) pre-deactivation token rejected on an active-user endpoint
    r = await client.get("/patients", headers=bearer(token_before))
    assert r.status_code == 403


@pytest.mark.auth
async def test_AUTH_05_expired_jwt_rejected(client, secret_key):
    expired = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(minutes=5)},
        secret_key, algorithm="HS256",
    )
    r = await client.get("/auth/me", headers=bearer(expired))
    assert r.status_code == 401


@pytest.mark.auth
async def test_AUTH_06_token_tampering_and_alg_none(client, admin_token, secret_key):
    # (a) tampered signature on an otherwise valid token
    tampered = admin_token[:-1] + ("a" if admin_token[-1] != "a" else "b")
    assert (await client.get("/auth/me", headers=bearer(tampered))).status_code == 401

    # (b) alg=none token
    header = _b64url(json.dumps({"alg": "none", "typ": "JWT"}).encode())
    payload = _b64url(json.dumps({"sub": "1"}).encode())
    none_token = f"{header}.{payload}."
    assert (await client.get("/auth/me", headers=bearer(none_token))).status_code == 401

    # (c) HS256 signed with empty-string key
    empty_key_token = jwt.encode({"sub": "1"}, "", algorithm="HS256")
    assert (await client.get("/auth/me", headers=bearer(empty_key_token))).status_code == 401


@pytest.mark.auth
async def test_AUTH_07_default_secret_key_not_active(client):
    forged = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        DEFAULT_INSECURE_SECRET, algorithm="HS256",
    )
    r = await client.get("/auth/me", headers=bearer(forged))
    # 200 here would mean the deployment still signs with the committed default.
    assert r.status_code == 401, "CRITICAL: server accepts tokens signed with the default SECRET_KEY"


@pytest.mark.auth
async def test_AUTH_08_reset_token_single_use(client, ephemeral_user):
    token = mint_reset_token(ephemeral_user["email"])
    if not token:
        pytest.skip("Cannot mint reset token (backend package/DB not importable from test env)")

    r1 = await client.post("/auth/set-password", json={"token": token, "new_password": "FreshStrongPass1!"})
    assert r1.status_code == 200

    r2 = await client.post("/auth/set-password", json={"token": token, "new_password": "AnotherPass1!"})
    assert r2.status_code == 400
    assert "invalid or expired" in r2.json()["detail"].lower()


@pytest.mark.auth
async def test_AUTH_09_forgot_password_no_user_enumeration(client, admin_user):
    t0 = time.perf_counter()
    r_known = await client.post("/auth/forgot-password", json={"email": admin_user["email"]})
    dt_known = time.perf_counter() - t0

    t0 = time.perf_counter()
    r_unknown = await client.post("/auth/forgot-password", json={"email": f"nobody_{uuid.uuid4().hex}@example.com"})
    dt_unknown = time.perf_counter() - t0

    assert r_known.status_code == 200 and r_unknown.status_code == 200
    assert r_known.json() == r_unknown.json()  # identical generic message
    # Loose timing sanity (not a strict oracle): neither path blocks for seconds.
    assert dt_known < 5 and dt_unknown < 5


@pytest.mark.auth
async def test_AUTH_10_password_change_requires_current(client, ephemeral_user):
    token = ephemeral_user["token"]
    r = await client.put(
        "/auth/me",
        json={"new_password": "NewPass123!", "current_password": "wrong-current"},
        headers=bearer(token),
    )
    assert r.status_code == 400
    assert "current password is incorrect" in r.json()["detail"].lower()

    # Password must be unchanged → old password still authenticates.
    r = await client.post("/auth/login", json={"email": ephemeral_user["email"], "password": ephemeral_user["password"]})
    assert r.status_code == 200


@pytest.mark.auth
@pytest.mark.xfail(reason="AUTH-11: no password-length/complexity policy at set-password (open defect)", strict=False)
async def test_AUTH_11_weak_password_rejected(client, ephemeral_user):
    token = mint_reset_token(ephemeral_user["email"])
    if not token:
        pytest.skip("Cannot mint reset token (backend package/DB not importable from test env)")
    r = await client.post("/auth/set-password", json={"token": token, "new_password": "a"})
    assert r.status_code in (400, 422), "weak 1-char password should be rejected by a policy"


@pytest.mark.auth
async def test_AUTH_12_admin_cannot_self_delete_or_deactivate(client, admin_token, admin_user):
    uid = admin_user["id"]
    r = await client.delete(f"/auth/users/{uid}", headers=bearer(admin_token))
    assert r.status_code == 400
    assert "your own account" in r.json()["detail"].lower()

    r = await client.put(f"/auth/users/{uid}", json={"status": False}, headers=bearer(admin_token))
    assert r.status_code == 400
    assert "your own account" in r.json()["detail"].lower()


# =============================================================================
# RBAC
# =============================================================================

@pytest.mark.rbac
async def test_RBAC_01_role_whitelist_enforced(client, admin_token, ephemeral_user):
    uid = ephemeral_user["id"]

    for bad in ("SuperDuperAdmin", "root"):
        r = await client.put(f"/auth/users/{uid}", json={"role": bad}, headers=bearer(admin_token))
        assert r.status_code == 422
        assert "allowed roles" in r.json()["detail"].lower()

    # Case/space normalisation: "aDmIn" → "Admin"
    r = await client.put(f"/auth/users/{uid}", json={"role": "aDmIn"}, headers=bearer(admin_token))
    assert r.status_code == 200
    assert r.json()["role"] == "Admin"


@pytest.mark.rbac
async def test_RBAC_02_assistant_blocked_from_admin_endpoints(client, assistant_token, admin_user):
    h = bearer(assistant_token)
    assert (await client.get("/auth/users", headers=h)).status_code == 403
    assert (await client.get("/dashboard/audit-logs", headers=h)).status_code == 403
    assert (await client.get("/dashboard/user-roles", headers=h)).status_code == 403
    assert (await client.delete(f"/auth/users/{admin_user['id']}", headers=h)).status_code == 403
    reg = await client.post(
        "/auth/register",
        json={"email": f"x_{uuid.uuid4().hex[:8]}@example.com", "password": "P1!", "role": "Clinician"},
        headers=h,
    )
    assert reg.status_code == 403


@pytest.mark.rbac
async def test_RBAC_03_treatment_plan_writes_restricted(client, assistant_token, patient):
    h = bearer(assistant_token)
    create_body = {"patient_id": patient["id"], "plan_date": "2026-06-13", "title": "QA", "plan_type": "General"}
    assert (await client.post("/treatment-plans", json=create_body, headers=h)).status_code == 403
    assert (await client.put("/treatment-plans/1", json={"title": "x"}, headers=h)).status_code == 403
    assert (await client.delete("/treatment-plans/1", headers=h)).status_code == 403


@pytest.mark.rbac
async def test_RBAC_04_results_list_scoped_per_role(client, admin_token, assistant_token):
    r_admin = await client.get("/results/", headers=bearer(admin_token))
    r_assist = await client.get("/results/", headers=bearer(assistant_token))
    assert r_admin.status_code == 200 and r_assist.status_code == 200
    assert isinstance(r_admin.json(), list) and isinstance(r_assist.json(), list)
    # Admin sees everything; assistant sees a subset (own uploads only).
    assert len(r_admin.json()) >= len(r_assist.json())


@pytest.mark.rbac
@pytest.mark.xfail(reason="RBAC-05: per-patient result scoping was missing; FIXED this branch → expect XPASS", strict=False)
async def test_RBAC_05_per_patient_results_scoped(client, assistant_token, patient):
    """Assistant must only ever see their OWN results for a patient (or none),
    never another user's. Under the old code this returned every row → fails → XFAIL.
    With the fix it filters by user_id → passes → XPASS."""
    me = (await client.get("/auth/me", headers=bearer(assistant_token))).json()
    r = await client.get(f"/results/patient/{patient['id']}", headers=bearer(assistant_token))
    assert r.status_code in (200, 403, 404)
    if r.status_code == 200:
        rows = r.json()
        assert all(row.get("user_id") == me["id"] for row in rows), "assistant saw results they don't own"


@pytest.mark.rbac
@pytest.mark.xfail(reason="RBAC-06: patient delete not restricted to Admin/Clinician (open — verify role matrix)", strict=False)
async def test_RBAC_06_patient_delete_authority(client, assistant_token, ephemeral_patient):
    r = await client.delete(f"/patients/{ephemeral_patient['id']}", headers=bearer(assistant_token))
    assert r.status_code == 403, "Assistant should not be able to delete patient records"


@pytest.mark.rbac
async def test_RBAC_07_blockchain_decrypt_requires_auth(client, patient, assistant_token):
    recs = await client.get(f"/patients/{patient['id']}/blockchain-records", headers=bearer(assistant_token))
    if recs.status_code != 200 or not (recs.json() or {}).get("records"):
        pytest.skip("No on-chain records for this patient to exercise decrypt scoping")
    cid = recs.json()["records"][0].get("cid") or recs.json()["records"][0]
    # Unauthenticated decrypt must be refused outright.
    anon = await client.get(f"/patients/{patient['id']}/blockchain-records/{cid}/decrypt")
    assert anon.status_code in (401, 403)


@pytest.mark.rbac
@pytest.mark.xfail(reason="RBAC-08: staff/patient id-collision crossover possible (token sub is just an int)", strict=False)
async def test_RBAC_08_mobile_token_cannot_reach_staff_api(client, sync_client, patient):
    login = sync_client.post("/mobile/login", json={"hospital_id": patient["hospital_id"]})
    if login.status_code != 200:
        pytest.skip("Mobile login unavailable for this patient")
    mobile_token = login.json()["token"]
    r = await client.get("/auth/me", headers=bearer(mobile_token))
    assert r.status_code == 401, "a mobile (patient) token must not authenticate against staff endpoints"


@pytest.mark.rbac
async def test_RBAC_09_caretaker_cannot_mutate_clinical_fields(client, sync_client, patient):
    # Caretaker login needs a registered caretaker phone; skip if none seeded.
    cks = sync_client.get(f"/patients/{patient['id']}/caretakers",
                          headers=bearer(_first_staff_token(sync_client)))
    if cks.status_code != 200 or not cks.json():
        pytest.skip("No caretaker registered for this patient")
    phone = cks.json()[0].get("phone")
    login = sync_client.post("/mobile/caretaker-login", json={"hospital_id": patient["hospital_id"], "phone": phone})
    if login.status_code != 200:
        pytest.skip("Caretaker login failed")
    ck_token = login.json()["token"]
    # PUT /mobile/patient was removed (MOB-04 fix); any clinical mutation must not succeed.
    r = await client.put("/mobile/patient", json={"tumour_type": "No Tumour"}, headers=bearer(ck_token))
    assert r.status_code in (403, 404, 405)


def _first_staff_token(sync_client):
    from conftest import CREDENTIALS, _login
    for role in ("admin", "superadmin", "clinician", "assistant"):
        email, pw = CREDENTIALS[role]
        tok = _login(sync_client, email, pw)
        if tok:
            return tok
    pytest.skip("No staff token available")


# =============================================================================
# UPL  (uploads)
# =============================================================================

def _img_file(name, data, content_type):
    return {"file": (name, data, content_type)}


@pytest.mark.upl
async def test_UPL_01_reject_disallowed_content_types(client, clinician_token, patient):
    h = bearer(clinician_token)
    cases = [
        ("evil.exe", b"MZ\x90\x00", "application/x-msdownload"),
        ("report.pdf", b"%PDF-1.4", "application/pdf"),
        ("x.svg", b"<svg/>", "image/svg+xml"),
        ("x.html", b"<html></html>", "text/html"),
    ]
    for name, data, ct in cases:
        r = await client.post("/results/upload", files=_img_file(name, data, ct),
                              data={"patient_id": str(patient["id"])}, headers=h)
        assert r.status_code == 400, f"{ct} should be rejected"
        assert "unsupported file type" in r.json()["detail"].lower()


@pytest.mark.upl
async def test_UPL_03_path_traversal_filename_neutralised(client, clinician_token, patient):
    """A traversal filename with an image content-type must not write outside uploads.
    Server replaces the name with a UUID; we assert no escaped file appears."""
    h = bearer(clinician_token)
    repo_root = os.path.dirname(os.path.dirname(__file__))
    sentinel = os.path.join(repo_root, "evil.jpg")
    before = os.path.exists(sentinel)
    r = await client.post(
        "/results/upload",
        files=_img_file("scan/../../evil.jpg", TINY_PNG, "image/jpeg"),
        data={"patient_id": str(patient["id"])},
        headers=h,
    )
    # Accept any non-path-error outcome (200 ok, 400 bad image, 503 model cold).
    assert r.status_code in (200, 400, 503)
    assert os.path.exists(sentinel) == before, "traversal filename escaped the uploads directory"


@pytest.mark.upl
@pytest.mark.xfail(reason="UPL-04: MRI upload had no size cap; 20MB limit ADDED this branch → expect XPASS", strict=False)
async def test_UPL_04_oversized_upload_rejected(client, clinician_token, patient):
    big = b"\xff" * (21 * 1024 * 1024)  # 21 MB, over the 20 MB cap
    r = await client.post(
        "/results/upload",
        files=_img_file("big.jpg", big, "image/jpeg"),
        data={"patient_id": str(patient["id"])},
        headers=bearer(clinician_token),
    )
    assert r.status_code in (400, 413), "oversized upload should be rejected with a size error"


@pytest.mark.upl
async def test_UPL_05_corrupt_and_zero_byte_images(client, clinician_token, patient):
    h = bearer(clinician_token)
    for name, data in [("empty.jpg", b""), ("truncated.jpg", b"\xff\xd8\xff\xe0bogus")]:
        r = await client.post("/results/upload", files=_img_file(name, data, "image/jpeg"),
                              data={"patient_id": str(patient["id"])}, headers=h)
        # Graceful failure (unreadable image) or model-cold; never a hang/crash.
        assert r.status_code in (400, 503)


@pytest.mark.upl
async def test_UPL_08_upload_for_nonexistent_patient(client, clinician_token):
    r = await client.post(
        "/results/upload",
        files=_img_file("scan.jpg", TINY_PNG, "image/jpeg"),
        data={"patient_id": "999999"},
        headers=bearer(clinician_token),
    )
    assert r.status_code == 404
    assert "patient not found" in r.json()["detail"].lower()


@pytest.mark.upl
async def test_UPL_09_avatar_limits_enforced(client, ephemeral_user):
    h = bearer(ephemeral_user["token"])

    # 6 MB PNG → over 5 MB cap
    r = await client.post("/auth/me/avatar",
                          files=_img_file("a.png", b"\x89PNG" + b"\x00" * (6 * 1024 * 1024), "image/png"),
                          headers=h)
    assert r.status_code == 400 and "5 mb" in r.json()["detail"].lower()

    # GIF → not in whitelist
    r = await client.post("/auth/me/avatar", files=_img_file("a.gif", b"GIF89a", "image/gif"), headers=h)
    assert r.status_code == 400

    # 4 MB WebP → accepted
    r = await client.post("/auth/me/avatar",
                          files=_img_file("a.webp", b"RIFF" + b"\x00" * (4 * 1024 * 1024), "image/webp"),
                          headers=h)
    assert r.status_code == 200
    assert r.json().get("profile_picture")


@pytest.mark.upl
@pytest.mark.xfail(reason="UPL-10: document upload had no type/size/patient checks; ADDED this branch → expect XPASS", strict=False)
async def test_UPL_10_document_upload_validation(client, clinician_token, patient):
    h = bearer(clinician_token)

    # disallowed type
    r = await client.post("/documents/upload",
                          files=_img_file("x.exe", b"MZ", "application/x-msdownload"),
                          data={"patient_id": str(patient["id"])}, headers=h)
    assert r.status_code == 400

    # nonexistent patient
    r = await client.post("/documents/upload",
                          files=_img_file("x.pdf", b"%PDF-1.4", "application/pdf"),
                          data={"patient_id": "999999"}, headers=h)
    assert r.status_code == 404

    # oversize (26 MB > 25 MB cap)
    r = await client.post("/documents/upload",
                          files=_img_file("big.pdf", b"%PDF" + b"\x00" * (26 * 1024 * 1024), "application/pdf"),
                          data={"patient_id": str(patient["id"])}, headers=h)
    assert r.status_code in (400, 413)


@pytest.mark.upl
@pytest.mark.xfail(reason="UPL-11: PHI static mounts were unauthenticated; auth ADDED this branch → expect XPASS", strict=False)
async def test_UPL_11_static_phi_requires_auth(client):
    # No Authorization header → must be refused before any file lookup.
    mri = await client.get(f"/uploaded_mris/uploads/{uuid.uuid4().hex}.jpg")
    assert mri.status_code == 401
    doc = await client.get(f"/uploaded_docs/{uuid.uuid4().hex}.pdf")
    assert doc.status_code == 401


@pytest.mark.upl
@pytest.mark.slow
@pytest.mark.skipif(not RUN_MODEL, reason="needs ML model loaded; set RUN_MODEL=1")
async def test_UPL_02_content_type_spoof_decoded(client, clinician_token, patient):
    # A non-image payload with an image content-type must fail at decode, not persist.
    r = await client.post(
        "/results/upload",
        files=_img_file("scan.jpg", b"#!/bin/sh\necho pwned\n", "image/jpeg"),
        data={"patient_id": str(patient["id"])},
        headers=bearer(clinician_token),
    )
    assert r.status_code in (400, 500, 503)


@pytest.mark.upl
@pytest.mark.slow
@pytest.mark.skipif(not RUN_MODEL, reason="needs ML model loaded; set RUN_MODEL=1")
async def test_UPL_07_valid_mri_accepted(client, clinician_token, patient):
    r = await client.post(
        "/results/upload",
        files=_img_file("scan.png", TINY_PNG, "image/png"),
        data={"patient_id": str(patient["id"])},
        headers=bearer(clinician_token),
    )
    assert r.status_code == 200
    body = r.json()
    assert body["predicted_label"] in {"Glioma", "Meningioma", "No Tumour", "Pituitary"}
    assert 0 < body["confidence"] <= 1


# =============================================================================
# DATA
# =============================================================================

@pytest.mark.data
@pytest.mark.skipif(not RUN_DESTRUCTIVE, reason="deletes data; set RUN_DESTRUCTIVE=1")
async def test_DATA_01_patient_deletion_integrity(client, admin_token, ephemeral_patient):
    pid = ephemeral_patient["id"]
    r = await client.delete(f"/patients/{pid}", headers=bearer(admin_token))
    assert r.status_code in (200, 204)
    # Patient gone → subsequent fetch 404.
    assert (await client.get(f"/patients/{pid}", headers=bearer(admin_token))).status_code == 404


@pytest.mark.data
async def test_DATA_02_audit_logs_admin_only(client, admin_token, assistant_token):
    r = await client.get("/dashboard/audit-logs", headers=bearer(admin_token))
    assert r.status_code == 200
    logs = r.json()
    assert isinstance(logs, list)
    if logs:
        entry = logs[0]
        assert "ip" in entry or "timestamp" in entry or "action" in entry or "event" in entry

    # Non-admin refused.
    assert (await client.get("/dashboard/audit-logs", headers=bearer(assistant_token))).status_code == 403


@pytest.mark.data
async def test_DATA_03_health_endpoints(client):
    r = await client.get("/health")
    assert r.status_code == 200 and r.json().get("status") == "ok"
    r = await client.get("/health/model")
    assert r.status_code == 200 and "status" in r.json()


@pytest.mark.data
async def test_DATA_04_cors_rejects_unknown_origin(client):
    r = await client.post(
        "/auth/login",
        json={"email": "x@y.test", "password": "p"},
        headers={"Origin": "http://evil.test"},
    )
    acao = r.headers.get("access-control-allow-origin")
    assert acao != "http://evil.test", "CORS must not reflect an arbitrary origin"


@pytest.mark.data
async def test_DATA_05_no_credential_leak_in_user_list(client, admin_token):
    r = await client.get("/auth/users", headers=bearer(admin_token))
    assert r.status_code == 200
    forbidden = {"password_hash", "password", "password_reset_token_hash"}
    for user in r.json():
        assert forbidden.isdisjoint(user.keys()), f"credential field leaked: {set(user) & forbidden}"


# =============================================================================
# API
# =============================================================================

@pytest.mark.api
@pytest.mark.xfail(reason="API-02: /health/model?load=true is unauthenticated and can force model load (open DoS vector)", strict=False)
async def test_API_02_health_model_load_param_guarded(client):
    assert (await client.get("/health")).status_code == 200
    # Anonymous caller should NOT be able to trigger an expensive load.
    r = await client.get("/health/model", params={"load": "true"})
    assert r.status_code in (401, 403), "load=true should require authentication"


# Keep API-01 LAST: it intentionally exhausts the login rate-limit window.
@pytest.mark.api
@pytest.mark.xfail(reason="API-01: no auth rate limiting; sliding-window limiter ADDED this branch → expect XPASS", strict=False)
async def test_API_01_login_rate_limiting(client):
    # Burst past whatever the configured staff-login limit is (default 10; the
    # test backend raises it via STAFF_LOGIN_MAX to avoid throttling the suite).
    statuses = []
    for _ in range(int(os.getenv("STAFF_LOGIN_MAX", "10")) + 20):
        r = await client.post("/auth/login", json={"email": "burst@example.com", "password": "nope"})
        statuses.append(r.status_code)
        if r.status_code == 429:
            break
    assert 429 in statuses, "expected throttling (429) after repeated login attempts"
