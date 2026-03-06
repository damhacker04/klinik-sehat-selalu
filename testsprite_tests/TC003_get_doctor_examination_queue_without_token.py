import requests

BASE_URL = "http://localhost:3000"

def test_get_doctor_examination_queue_without_token():
    url = f"{BASE_URL}/api/dokter/pemeriksaan"
    headers = {
        # No Authorization header provided
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 401, f"Expected status code 401 but got {response.status_code}"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_doctor_examination_queue_without_token()