import requests

def test_get_current_patient_queue_without_authentication():
    base_url = "http://localhost:3000"
    endpoint = "/api/pasien/antrian"
    url = base_url + endpoint
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"
    assert isinstance(data, list), "Response JSON should be a list (Queue[])"


test_get_current_patient_queue_without_authentication()