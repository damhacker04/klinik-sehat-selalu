import requests

BASE_URL = "http://localhost:3000"
ADMIN_LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"
ADMIN_JADWAL_ENDPOINT = f"{BASE_URL}/api/admin/jadwal"
TIMEOUT = 30

def test_get_admin_schedule_list_with_valid_token():
    admin_credentials = {
        "username": "admin",  # Replace with valid admin username
        "password": "adminpassword"  # Replace with valid admin password
    }

    try:
        # Login as admin to get token
        login_resp = requests.post(ADMIN_LOGIN_ENDPOINT, json=admin_credentials, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Admin login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "token" in login_data, "Token not found in login response"
        token = login_data["token"]

        headers = {
            "Authorization": f"Bearer {token}"
        }
        # Get admin schedule list
        jadwal_resp = requests.get(ADMIN_JADWAL_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert jadwal_resp.status_code == 200, f"Expected 200 OK but got {jadwal_resp.status_code}"
        schedules = jadwal_resp.json()
        # Ensure response is a list (Schedule[])
        assert isinstance(schedules, list), "Response is not a list of schedules"
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_get_admin_schedule_list_with_valid_token()