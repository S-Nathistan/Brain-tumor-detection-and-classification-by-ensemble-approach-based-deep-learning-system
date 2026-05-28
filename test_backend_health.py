#!/usr/bin/env python3
import sys
import json

# Test if backend is reachable
try:
    import requests
    response = requests.get('http://localhost:8000/health', timeout=5)
    print(f"Backend Status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError as e:
    print(f"Error: Cannot connect to backend - {str(e)}")
    sys.exit(1)
except requests.exceptions.Timeout:
    print("Error: Backend request timed out")
    sys.exit(1)
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
    sys.exit(1)
