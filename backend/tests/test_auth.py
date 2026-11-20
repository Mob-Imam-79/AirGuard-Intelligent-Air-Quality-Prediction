import pytest

def test_register_new_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Priya Patel",
            "email": "priya.patel@example.com",
            "password": "SecurePassword123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "priya.patel@example.com"
    assert data["user"]["name"] == "Priya Patel"

def test_register_duplicate_email(client):
    payload = {
        "name": "Duplicate User",
        "email": "testuser@airguard.com",
        "password": "Password123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@airguard.com",
            "password": "TestUser@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testuser@airguard.com"

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@airguard.com",
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401

