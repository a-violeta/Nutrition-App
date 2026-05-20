def create_user_and_get_token(client):
    client.post(
        "/auth/register",
        json={
            "name": "Food User",
            "email": "food@example.com",
            "password": "test123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "food@example.com",
            "password": "test123"
        }
    )

    return response.json()["access_token"]


def test_add_food_log(client):
    token = create_user_and_get_token(client)

    response = client.post(
        "/food-log/",
        json={
            "food_id": 1,
            "quantity": 2,
            "meal_type": "lunch"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["quantity"] == 2
    assert data["meal_type"] == "lunch"


def test_get_food_log(client):
    token = create_user_and_get_token(client)

    client.post(
        "/food-log/",
        json={
            "food_id": 1,
            "quantity": 1,
            "meal_type": "breakfast"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    response = client.get(
        "/food-log/",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) >= 1
    assert any(entry["meal_type"] == "breakfast" for entry in data)


def test_delete_food_log(client):
    token = create_user_and_get_token(client)

    create_response = client.post(
        "/food-log/",
        json={
            "food_id": 1,
            "quantity": 1,
            "meal_type": "dinner"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    entry_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/food-log/{entry_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert delete_response.status_code == 204