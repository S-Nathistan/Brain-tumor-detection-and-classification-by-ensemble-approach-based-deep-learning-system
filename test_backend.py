import requests
import sys

BASE_URL = "http://localhost:8000"

def test_backend():
    # 1. Health check (if exists) or just root
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"/health: {r.status_code}")
    except Exception as e:
        print(f"/health failed: {e}")

    # 2. Login
    token = None
    try:
        payload = {"email": "test4@gmail.com", "password": "1234", "name": "Test", "role": "Clinician"}
        r = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"/auth/login: {r.status_code}")
        if r.status_code == 200:
            token = r.json().get("access_token")
            print("Login successful")
        else:
            print(f"Login failed: {r.text}")
    except Exception as e:
        print(f"/auth/login failed: {e}")

    if not token:
        print("Cannot proceed without token")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Dashboard Summary (Suspected issue)
    try:
        r = requests.get(f"{BASE_URL}/dashboard/summary", headers=headers)
        print(f"/dashboard/summary: {r.status_code}")
        if r.status_code != 200:
            print(f"Error: {r.text}")
    except Exception as e:
        print(f"/dashboard/summary failed: {e}")

    # 4. Test Dashboard Audit Logs
    try:
        r = requests.get(f"{BASE_URL}/dashboard/audit-logs", headers=headers)
        print(f"/dashboard/audit-logs: {r.status_code}")
        if r.status_code != 200:
            print(f"Error: {r.text}")
    except Exception as e:
        print(f"/dashboard/audit-logs failed: {e}")

if __name__ == "__main__":
    test_backend()
