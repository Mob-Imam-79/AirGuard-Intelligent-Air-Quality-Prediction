import pytest

def get_auth_token(client, email="testuser@airguard.com", password="TestUser@123"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

def test_prediction_workflow(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "pm25": 42.0,
        "pm10": 78.0,
        "no2": 18.0,
        "so2": 7.0,
        "co": 0.6,
        "o3": 24.0,
        "temperature": 29.0,
        "humidity": 56.0
    }
    
    response = client.post("/api/v1/predict/", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_aqi" in data
    assert data["predicted_aqi"] > 0
    assert data["category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
    assert len(data["health_recommendation"]) > 10
    assert "model_used" in data
    
    pred_id = data["id"]
    
    # Check history
    history_res = client.get("/api/v1/history/", headers=headers)
    assert history_res.status_code == 200
    hist_data = history_res.json()
    assert hist_data["total"] >= 1
    assert any(item["id"] == pred_id for item in hist_data["items"])
    
    # Check detail
    detail_res = client.get(f"/api/v1/history/{pred_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["predicted_aqi"] == data["predicted_aqi"]

def test_prediction_validation_rejection(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Out of range pm25
    invalid_payload = {
        "pm25": -10.0,  # Negative value
        "pm10": 78.0,
        "no2": 18.0,
        "so2": 7.0,
        "co": 0.6,
        "o3": 24.0,
        "temperature": 29.0,
        "humidity": 56.0
    }
    response = client.post("/api/v1/predict/", json=invalid_payload, headers=headers)
    assert response.status_code == 422  # Pydantic validation error

def test_analytics_and_reports(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a prediction first
    payload = {
        "pm25": 55.0,
        "pm10": 110.0,
        "no2": 35.0,
        "so2": 15.0,
        "co": 1.2,
        "o3": 45.0,
        "temperature": 26.0,
        "humidity": 60.0
    }
    client.post("/api/v1/predict/", json=payload, headers=headers)
    
    # Dashboard summary
    dash_res = client.get("/api/v1/analytics/dashboard-summary", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_predictions"] >= 1
    assert dash_data["latest_prediction"] is not None
    
    # CSV export
    csv_res = client.get("/api/v1/reports/export/csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Prediction ID" in csv_res.text

    # PDF export
    pdf_res = client.get("/api/v1/reports/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert "application/pdf" in pdf_res.headers["content-type"]
    assert pdf_res.content[:4] == b"%PDF"

def test_admin_access_control(client):
    user_token = get_auth_token(client, "testuser@airguard.com", "TestUser@123")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Non-admin user should be blocked from admin stats
    unauth_res = client.get("/api/v1/admin/stats", headers=user_headers)
    assert unauth_res.status_code == 403
    
    # Admin user should succeed
    admin_token = get_auth_token(client, "testadmin@airguard.com", "TestAdmin@123")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    auth_res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert auth_res.status_code == 200
    assert "total_users" in auth_res.json()

