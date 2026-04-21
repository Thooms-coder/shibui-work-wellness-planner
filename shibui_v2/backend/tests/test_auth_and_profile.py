def test_signup_returns_token_and_user(client):
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "hello@example.com",
            "password": "securepass123",
            "full_name": "Hello User",
            "timezone": "America/New_York",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["user"]["email"] == "hello@example.com"
    assert payload["token"]["access_token"]
    assert payload["token"]["token_type"] == "bearer"


def test_duplicate_signup_returns_conflict(client):
    payload = {
        "email": "dupe@example.com",
        "password": "securepass123",
        "full_name": "Duplicate User",
        "timezone": "America/New_York",
    }

    first_response = client.post("/api/auth/signup", json=payload)
    second_response = client.post("/api/auth/signup", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "An account with this email already exists."


def test_login_succeeds_after_signup(client):
    client.post(
        "/api/auth/signup",
        json={
            "email": "login@example.com",
            "password": "securepass123",
            "full_name": "Login User",
            "timezone": "America/New_York",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@example.com",
            "password": "securepass123",
        },
    )

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "login@example.com"


def test_login_with_wrong_password_returns_unauthorized(client):
    client.post(
        "/api/auth/signup",
        json={
            "email": "wrongpass@example.com",
            "password": "securepass123",
            "full_name": "Wrong Password User",
            "timezone": "America/New_York",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "incorrectpass123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."


def test_profile_and_onboarding_flow(client, auth_headers):
    profile_response = client.get("/api/profile/me", headers=auth_headers)
    assert profile_response.status_code == 200
    profile = profile_response.json()
    assert profile["preferences"]["onboarding_completed"] is False

    onboarding_response = client.put(
        "/api/profile/onboarding",
        headers=auth_headers,
        json={
            "timezone": "America/Los_Angeles",
            "workday_start_hour": 8,
            "workday_end_hour": 17,
            "movement_days_per_week": 4,
            "planning_style": "Balanced and sustainable",
        },
    )

    assert onboarding_response.status_code == 200
    payload = onboarding_response.json()
    assert payload["timezone"] == "America/Los_Angeles"
    assert payload["preferences"]["workday_start_hour"] == 8
    assert payload["preferences"]["onboarding_completed"] is True


def test_profile_requires_authentication(client):
    response = client.get("/api/profile/me")
    assert response.status_code == 401


def test_onboarding_rejects_invalid_workday_range(client, auth_headers):
    response = client.put(
        "/api/profile/onboarding",
        headers=auth_headers,
        json={
            "timezone": "America/New_York",
            "workday_start_hour": 18,
            "workday_end_hour": 9,
            "movement_days_per_week": 3,
            "planning_style": "Balanced and sustainable",
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Workday end hour must be after workday start hour."
