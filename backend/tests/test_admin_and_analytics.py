import pytest

def get_auth_token(client, email="testuser@airguard.com", password="TestUser@123"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

def get_admin_token(client):
    return get_auth_token(client, email="testadmin@airguard.com", password="TestAdmin@123")

def test_admin_endpoints_authorization(client):
    user_token = get_auth_token(client)
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    admin_token = get_admin_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Non-admin should be rejected (403)
    res_forbidden = client.get("/api/v1/admin/stats", headers=user_headers)
    assert res_forbidden.status_code == 403

    # 2. Admin should succeed (200)
    res_admin = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res_admin.status_code == 200
    stats = res_admin.json()
    assert "total_users" in stats
    assert "total_predictions" in stats
    assert "active_model" in stats

def test_admin_user_management(client):
    admin_headers = {"Authorization": f"Bearer {get_admin_token(client)}"}

    # Get all users
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 2

    # Find regular user
    regular = next((u for u in users if u["email"] == "testuser@airguard.com"), None)
    assert regular is not None

    # Update status
    update_res = client.put(
        f"/api/v1/admin/users/{regular['id']}/status",
        json={"is_active": True, "role": "user"},
        headers=admin_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["is_active"] is True

def test_admin_datasets_and_preview(client):
    admin_headers = {"Authorization": f"Bearer {get_admin_token(client)}"}

    # Datasets
    ds_res = client.get("/api/v1/admin/datasets", headers=admin_headers)
    assert ds_res.status_code == 200
    datasets = ds_res.json()
    assert len(datasets) >= 1
    assert "CPCB" in datasets[0]["name"]

    # Dataset preview
    preview_res = client.get("/api/v1/admin/dataset-preview?limit=5", headers=admin_headers)
    assert preview_res.status_code == 200
    rows = preview_res.json()
    assert len(rows) <= 5
    if len(rows) > 0:
        assert "pm25" in rows[0]
        assert "aqi" in rows[0]

def test_admin_predictions_monitoring(client):
    admin_headers = {"Authorization": f"Bearer {get_admin_token(client)}"}

    res = client.get("/api/v1/admin/predictions?page=1&limit=10", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "items" in data

def test_user_profile_and_password_update(client):
    user_token = get_auth_token(client)
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Update profile name
    update_res = client.put(
        "/api/v1/users/profile",
        json={"name": "Updated Regular User"},
        headers=user_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Regular User"

    # 2. Change password
    pwd_res = client.put(
        "/api/v1/users/password",
        json={"current_password": "TestUser@123", "new_password": "NewTestUser@123"},
        headers=user_headers
    )
    assert pwd_res.status_code == 200
    assert "successfully" in pwd_res.json()["message"]

    # 3. Verify login with new password
    login_new = client.post("/api/v1/auth/login", json={"email": "testuser@airguard.com", "password": "NewTestUser@123"})
    assert login_new.status_code == 200

    # 4. Revert password back for test consistency
    new_token = login_new.json()["access_token"]
    client.put(
        "/api/v1/users/password",
        json={"current_password": "NewTestUser@123", "new_password": "TestUser@123"},
        headers={"Authorization": f"Bearer {new_token}"}
    )
