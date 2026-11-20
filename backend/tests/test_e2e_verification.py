import os
import time
import json
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.models.environmental_data import EnvironmentalData

def test_full_e2e_lifecycle():
    client = TestClient(app)
    ts = int(time.time())

    print("\n=== STEP 1: REGISTER NEW USER ===")
    reg_email = f"audit_user_{ts}@airguard.com"
    reg_pass = "SecurePass@2026"
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Audit Verified User",
        "email": reg_email,
        "password": reg_pass,
        "role": "USER"
    })
    print("Register status:", reg_res.status_code, reg_res.json())
    assert reg_res.status_code == 201
    user_id = reg_res.json()["user"]["id"]

    print("\n=== STEP 2: LOGIN ===")
    login_res = client.post("/api/v1/auth/login", json={
        "email": reg_email,
        "password": reg_pass
    })
    print("Login status:", login_res.status_code)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n=== STEP 3: GENERATE ACTUAL ML PREDICTION ===")
    pred_payload = {
        "pm25": 48.5,
        "pm10": 85.0,
        "no2": 22.0,
        "so2": 8.5,
        "co": 0.8,
        "o3": 35.0,
        "temperature": 27.5,
        "humidity": 62.0
    }
    pred_res = client.post("/api/v1/predict/", json=pred_payload, headers=headers)
    print("Prediction status:", pred_res.status_code)
    pred_json = pred_res.json()
    assert pred_res.status_code == 200
    assert "predicted_aqi" in pred_json
    pred_id = pred_json["id"]
    aqi_val = pred_json["predicted_aqi"]
    category = pred_json["category"]
    print(f"Prediction result: ID {pred_id}, AQI: {aqi_val}, Category: {category}")

    print("\n=== STEP 4: VERIFY DB PERSISTENCE DIRECTLY ===")
    db = SessionLocal()
    try:
        db_pred = db.query(Prediction).filter(Prediction.id == pred_id).first()
        assert db_pred is not None, "Prediction not found in DB!"
        assert db_pred.user_id == user_id
        db_env = db.query(EnvironmentalData).filter(EnvironmentalData.id == db_pred.environmental_data_id).first()
        assert db_env is not None
        assert db_env.pm25 == 48.5
        print(f"Verified in DB: Prediction ID {db_pred.id}, AQI: {db_pred.predicted_aqi}, Category: {db_pred.category}")
    finally:
        db.close()

    print("\n=== STEP 5: VERIFY HISTORY & ANALYTICS ===")
    hist_res = client.get("/api/v1/history/?page=1&limit=10", headers=headers)
    assert hist_res.status_code == 200
    hist_items = hist_res.json()["items"]
    assert len(hist_items) >= 1
    assert hist_items[0]["id"] == pred_id

    analytics_summary = client.get("/api/v1/analytics/dashboard-summary", headers=headers)
    assert analytics_summary.status_code == 200
    print("Analytics summary:", analytics_summary.json())

    pollutant_avg = client.get("/api/v1/analytics/pollutant-averages", headers=headers)
    assert pollutant_avg.status_code == 200
    print("Pollutant averages:", pollutant_avg.json())

    print("\n=== STEP 6: VERIFY PDF & CSV EXPORTS ===")
    pdf_res = client.get("/api/v1/reports/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b"%PDF")
    print(f"PDF Export OK: {len(pdf_res.content)} bytes")

    csv_res = client.get("/api/v1/reports/export/csv", headers=headers)
    assert csv_res.status_code == 200
    assert "Prediction ID" in csv_res.text
    assert str(pred_id) in csv_res.text
    print(f"CSV Export OK: {len(csv_res.text.splitlines())} lines generated")

    print("\n=== STEP 7: STRICT USER ISOLATION VERIFICATION ===")
    other_email = f"audit_other_{ts}@airguard.com"
    client.post("/api/v1/auth/register", json={
        "name": "Other User", "email": other_email, "password": "OtherPassword@123", "role": "USER"
    })
    other_login = client.post("/api/v1/auth/login", json={"email": other_email, "password": "OtherPassword@123"})
    other_token = other_login.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    other_hist = client.get("/api/v1/history/", headers=other_headers).json()
    assert other_hist["total"] == 0

    # Other user must NOT be able to view or delete first user record by ID (strict RBAC/isolation)
    other_get_first = client.get(f"/api/v1/history/{pred_id}", headers=other_headers)
    assert other_get_first.status_code == 403

    other_del_first = client.delete(f"/api/v1/history/{pred_id}", headers=other_headers)
    assert other_del_first.status_code == 403
    print("Strict multitenant data isolation verified! (HTTP 403 Forbidden returned on unauthorized access)")

    print("\n=== STEP 8: ADMIN ACCESS & RBAC VERIFICATION ===")
    user_admin_attempt = client.get("/api/v1/admin/stats", headers=headers)
    assert user_admin_attempt.status_code == 403
    print("RBAC verified: Standard user blocked from /api/v1/admin/stats with 403 Forbidden")

    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@airguard.com", "password": "Admin@123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    admin_stats = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert admin_stats.status_code == 200
    print("Admin stats:", admin_stats.json())

    admin_users = client.get("/api/v1/admin/users", headers=admin_headers)
    assert admin_users.status_code == 200

    admin_models = client.get("/api/v1/admin/models", headers=admin_headers)
    assert admin_models.status_code == 200

    admin_datasets = client.get("/api/v1/admin/datasets", headers=admin_headers)
    assert admin_datasets.status_code == 200

    admin_monitoring = client.get("/api/v1/admin/monitoring", headers=admin_headers)
    assert admin_monitoring.status_code == 200
    print("Admin monitoring verified.")

    print("\nALL 8 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_e2e_lifecycle()
