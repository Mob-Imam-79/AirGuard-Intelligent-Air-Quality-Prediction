import pytest

def get_auth_token(client, email="testuser@airguard.com", password="TestUser@123"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

# Matrix of environmental condition levels
CONDITION_MATRIX = [
    {
        "name": "Good Air Quality (via ANN)",
        "endpoint": "/api/v1/predict/ann",
        "payload": {"pm25": 16.79, "pm10": 34.12, "no2": 18.13, "so2": 9.11, "co": 0.53, "o3": 27.45, "temperature": 20.46, "humidity": 58.15},
        "expected_category": "Good",
        "max_aqi": 50.0
    },
    {
        "name": "Satisfactory Air Quality",
        "endpoint": "/api/v1/predict/random-forest",
        "payload": {"pm25": 42.0, "pm10": 75.0, "no2": 25.0, "so2": 12.0, "co": 0.7, "o3": 30.0, "temperature": 27.0, "humidity": 55.0},
        "expected_category": "Satisfactory",
        "min_aqi": 51.0,
        "max_aqi": 100.0
    },
    {
        "name": "Moderate Pollution",
        "endpoint": "/api/v1/predict/random-forest",
        "payload": {"pm25": 85.0, "pm10": 160.0, "no2": 60.0, "so2": 35.0, "co": 1.4, "o3": 65.0, "temperature": 28.0, "humidity": 60.0},
        "expected_category": "Moderate",
        "min_aqi": 101.0,
        "max_aqi": 200.0
    },
    {
        "name": "Poor Pollution",
        "endpoint": "/api/v1/predict/random-forest",
        "payload": {"pm25": 105.0, "pm10": 210.0, "no2": 85.0, "so2": 50.0, "co": 1.8, "o3": 80.0, "temperature": 28.0, "humidity": 60.0},
        "expected_category": "Poor",
        "min_aqi": 201.0,
        "max_aqi": 300.0
    },
    {
        "name": "Very Poor Pollution",
        "endpoint": "/api/v1/predict/random-forest",
        "payload": {"pm25": 220.0, "pm10": 380.0, "no2": 180.0, "so2": 120.0, "co": 4.5, "o3": 170.0, "temperature": 32.0, "humidity": 70.0},
        "expected_category": "Very Poor",
        "min_aqi": 301.0,
        "max_aqi": 400.0
    },
    {
        "name": "Severe / Emergency Pollution",
        "endpoint": "/api/v1/predict/random-forest",
        "payload": {"pm25": 380.0, "pm10": 580.0, "no2": 280.0, "so2": 190.0, "co": 8.0, "o3": 240.0, "temperature": 34.0, "humidity": 75.0},
        "expected_category": "Severe",
        "min_aqi": 401.0
    }
]

def test_prediction_condition_matrix(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    for scenario in CONDITION_MATRIX:
        endpoint = scenario.get("endpoint", "/api/v1/predict/random-forest")
        res = client.post(endpoint, json=scenario["payload"], headers=headers)
        assert res.status_code == 200, f"Failed on {scenario['name']}"
        data = res.json()
        assert data["category"] == scenario["expected_category"], f"Expected {scenario['expected_category']}, got {data['category']} for {scenario['name']}"
        if "max_aqi" in scenario:
            assert data["predicted_aqi"] <= scenario["max_aqi"] + 2.0  # slight numerical allowance
        if "min_aqi" in scenario:
            assert data["predicted_aqi"] >= scenario["min_aqi"] - 2.0

def test_negative_pollutant_validation_rejections(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    base = {"pm25": 25.0, "pm10": 50.0, "no2": 15.0, "so2": 5.0, "co": 0.5, "o3": 20.0, "temperature": 25.0, "humidity": 50.0}

    # Test negative values for each pollutant
    for field in ["pm25", "pm10", "no2", "so2", "co", "o3", "humidity"]:
        bad = dict(base)
        bad[field] = -5.0
        res = client.post("/api/v1/predict/", json=bad, headers=headers)
        assert res.status_code == 422, f"Failed to reject negative value for {field}"

def test_extreme_out_of_bounds_validation_rejections(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    base = {"pm25": 25.0, "pm10": 50.0, "no2": 15.0, "so2": 5.0, "co": 0.5, "o3": 20.0, "temperature": 25.0, "humidity": 50.0}

    # Exceeding physical bounds
    excessive_tests = [
        ("pm25", 1500.0),    # max is 1000
        ("pm10", 2500.0),    # max is 1500
        ("no2", 800.0),      # max is 500
        ("so2", 800.0),      # max is 500
        ("co", 100.0),       # max is 50
        ("o3", 800.0),       # max is 500
        ("humidity", 120.0), # max is 100%
        ("temperature", 85.0)# max is 60°C
    ]

    for field, val in excessive_tests:
        bad = dict(base)
        bad[field] = val
        res = client.post("/api/v1/predict/", json=bad, headers=headers)
        assert res.status_code == 422, f"Failed to reject excessive value {val} for {field}"

def test_missing_and_malformed_inputs(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Empty body
    res = client.post("/api/v1/predict/", json={}, headers=headers)
    assert res.status_code == 422

    # 2. Missing pm25
    partial = {"pm10": 50.0, "no2": 15.0, "so2": 5.0, "co": 0.5, "o3": 20.0, "temperature": 25.0, "humidity": 50.0}
    res = client.post("/api/v1/predict/", json=partial, headers=headers)
    assert res.status_code == 422

    # 3. String value instead of float
    bad_type = {"pm25": "not_a_number", "pm10": 50.0, "no2": 15.0, "so2": 5.0, "co": 0.5, "o3": 20.0, "temperature": 25.0, "humidity": 50.0}
    res = client.post("/api/v1/predict/", json=bad_type, headers=headers)
    assert res.status_code == 422

    # 4. Null value
    null_val = {"pm25": None, "pm10": 50.0, "no2": 15.0, "so2": 5.0, "co": 0.5, "o3": 20.0, "temperature": 25.0, "humidity": 50.0}
    res = client.post("/api/v1/predict/", json=null_val, headers=headers)
    assert res.status_code == 422

def test_history_model_used_reflection_and_deletion(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {"pm25": 42.0, "pm10": 78.0, "no2": 18.0, "so2": 7.0, "co": 0.6, "o3": 24.0, "temperature": 29.0, "humidity": 56.0}

    # Predict with Linear Regression
    lr_res = client.post("/api/v1/predict/linear-regression", json=payload, headers=headers)
    assert lr_res.status_code == 200
    lr_id = lr_res.json()["id"]

    # Predict with ANN
    ann_res = client.post("/api/v1/predict/ann", json=payload, headers=headers)
    assert ann_res.status_code == 200
    ann_id = ann_res.json()["id"]

    # Check history preserves the exact model_used
    hist_res = client.get("/api/v1/history/", headers=headers)
    assert hist_res.status_code == 200
    items = hist_res.json()["items"]

    lr_item = next((i for i in items if i["id"] == lr_id), None)
    assert lr_item is not None
    assert "Linear Regression" in lr_item["model_used"]

    ann_item = next((i for i in items if i["id"] == ann_id), None)
    assert ann_item is not None
    assert "Artificial Neural Network" in ann_item["model_used"] or "ANN" in ann_item["model_used"]

    # Test safe deletion of record
    del_res = client.delete(f"/api/v1/history/{lr_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Prediction deleted successfully."

    # Verify record is gone
    check_res = client.get(f"/api/v1/history/{lr_id}", headers=headers)
    assert check_res.status_code == 404
