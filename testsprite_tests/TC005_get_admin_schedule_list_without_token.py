import requests

BASE_URL = "http://localhost:3000"

def test_get_admin_schedule_list_without_token():
    url = f"{BASE_URL}/api/admin/jadwal"
    try:
        response = requests.get(url, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"
    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}"
    # Optionally, check if response has proper error message or structure
    # Example:
    # json_data = response.json()
    # assert "error" in json_data or "message" in json_data

test_get_admin_schedule_list_without_token()