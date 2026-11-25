import pytest
from backend.app.ml.uci_dataset_analyzer import inspect_uci_dataset_compatibility

def get_auth_token(client, email="testuser@airguard.com", password="TestUser@123"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

SAMPLE_PAYLOAD = {
    "pm25": 42.0,
    "pm10": 78.0,
    "no2": 18.0,
    "so2": 7.0,
    "co": 0.6,
    "o3": 24.0,
    "temperature": 29.0,
    "humidity": 56.0
}

def test_linear_regression_prediction(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/predict/linear-regression", json=SAMPLE_PAYLOAD, headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_aqi" in data
    assert data["predicted_aqi"] > 0
    assert "Linear Regression" in data["model_used"]
    assert data["category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]

def test_random_forest_prediction(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/predict/random-forest", json=SAMPLE_PAYLOAD, headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_aqi" in data
    assert data["predicted_aqi"] > 0
    assert "Random Forest" in data["model_used"]
    assert data["category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]

def test_ann_prediction(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/predict/ann", json=SAMPLE_PAYLOAD, headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert "predicted_aqi" in data
    assert data["predicted_aqi"] > 0
    assert "Artificial Neural Network" in data["model_used"] or "ANN" in data["model_used"]
    assert data["category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]

def test_model_comparison_endpoint(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/predict/compare", json=SAMPLE_PAYLOAD, headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert "predictions" in data
    assert len(data["predictions"]) == 3
    
    model_names = [p["model_name"] for p in data["predictions"]]
    assert any("Linear Regression" in name for name in model_names)
    assert any("Random Forest" in name for name in model_names)
    assert any("Neural Network" in name or "ANN" in name for name in model_names)
    
    for p in data["predictions"]:
        assert p["predicted_aqi"] > 0
        assert p["category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
        assert p["inference_time_ms"] >= 0
        assert "dominant_pollutant" in p
    
    assert "winning_model" in data
    assert data["winning_model"] in model_names

def test_model_metrics_endpoints(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET /api/v1/models/metrics
    res1 = client.get("/api/v1/models/metrics", headers=headers)
    assert res1.status_code == 200
    data1 = res1.json()
    assert "models" in data1
    assert len(data1["models"]) == 3
    
    keys = [m["key"] for m in data1["models"]]
    assert "linear_regression" in keys
    assert "random_forest" in keys
    assert "ann" in keys
    
    # Verify metrics fields for each model
    for model_info in data1["models"]:
        assert "mae" in model_info
        assert "rmse" in model_info
        assert "r2_score" in model_info
        assert "training_time_seconds" in model_info
        assert model_info["r2_score"] > 0.8
        
    # Test GET /api/v1/predict/models/metrics
    res2 = client.get("/api/v1/predict/models/metrics", headers=headers)
    assert res2.status_code == 200
    assert res2.json() == data1
    
    # Test GET /api/v1/models
    res3 = client.get("/api/v1/models", headers=headers)
    assert res3.status_code == 200
    data3 = res3.json()
    assert "models" in data3
    assert len(data3["models"]) >= 3

def test_uci_dataset_analyzer_report():
    analysis = inspect_uci_dataset_compatibility()
    assert "dataset_name" in analysis
    assert analysis["dataset_name"] == "UCI Air Quality Dataset"
    assert "MISSING" in analysis["feature_availability"]["pm25"]
    assert "MISSING" in analysis["feature_availability"]["pm10"]
    assert analysis["missing_value_marker"] == -200
    assert len(analysis["scientific_verdict"]) > 20
