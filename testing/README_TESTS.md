# Backend Security/Functional Test Suite

Covers QA test-plan Backend cases: **AUTH, RBAC, UPL, DATA, API**. Runs against a
live backend (default `http://localhost:8000`).

## Setup

```powershell
cd testing
pip install -r requirements-test.txt
```

Seed the Super Admin (gives admin/superadmin fixtures out of the box):

```powershell
python ../backend/seed_admin.py    # admin@neurosight.ai / admin123 (Super Admin)
```

For the RBAC role-isolation cases, provide real Clinician + Assistant logins:

```powershell
$env:NS_CLINICIAN_EMAIL="clinician@..."; $env:NS_CLINICIAN_PASSWORD="..."
$env:NS_ASSISTANT_EMAIL="assistant@..."; $env:NS_ASSISTANT_PASSWORD="..."
```

Tests requiring a missing role/account **skip** (never fail).

## Run

```powershell
pytest                       # fast security + functional checks
pytest -m "auth or rbac"     # one module group
$env:RUN_MODEL="1"; pytest   # also inference-dependent (slow) UPL cases
$env:RUN_DESTRUCTIVE="1"; pytest   # also delete/cascade (DATA-01) cases
```

## Reading results

- **xfail** = known-open defect (AUTH-11 weak-password policy, RBAC-06 patient-delete authority, API-02 health load param).
- **XPASS** = a previously-flagged defect that is now **fixed** in this branch
  (RBAC-05, UPL-04, UPL-10, UPL-11, API-01). The XPASS is the signal the fix landed.
- API-01 runs last on purpose — it exhausts the login rate-limit window (5 min).
