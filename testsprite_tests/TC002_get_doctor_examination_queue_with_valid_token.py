import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_doctor_examination_queue_with_valid_token():
    login_url = f"{BASE_URL}/api/auth/login"
    exam_queue_url = f"{BASE_URL}/api/dokter/pemeriksaan"

    doctor_credentials = {
        "username": "doctor1",
        "password": "doctorpassword"
    }

    try:
        # Login to get JWT token
        login_response = requests.post(login_url, json=doctor_credentials, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        token = login_response.json().get("token")
        assert token and isinstance(token, str), "Invalid or missing token in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Access the examination queue endpoint with valid token
        response = requests.get(exam_queue_url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"

        data = response.json()
        assert isinstance(data, list), "Response data should be a list (Queue[])"

    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_get_doctor_examination_queue_with_valid_token()