def test_register(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "test123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


def test_login(client):
    # register first
    client.post(
        "/auth/register",
        json={
            "name": "Login User",
            "email": "login@example.com",
            "password": "test123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "login@example.com",
            "password": "test123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


def test_protected_route_requires_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401