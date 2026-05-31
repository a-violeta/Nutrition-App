"""
Eval tests for AI agents.

Agent 1: Food Recommendation (gemma2:2b) - /ai/recommend
Agent 2: Daily Analysis (llama3.2:1b) - /ai/analyze-day

These tests use mocked Ollama responses to test the agents' behavior
without requiring a running Ollama instance.
"""

from unittest.mock import patch, AsyncMock
import pytest


# ── Helper: create user and get token ────────────────────────────────────────
def create_user_and_get_token(client, email="ai_test@example.com"):
    client.post(
        "/auth/register",
        json={"name": "AI Test User", "email": email, "password": "test123"},
    )
    response = client.post(
        "/auth/login",
        data={"username": email, "password": "test123"},
    )
    return response.json()["access_token"]


# ── Helper: add food log entry ────────────────────────────────────────────────
def add_food_log(client, token, food_id=1, meal_type="lunch"):
    return client.post(
        "/food-log/",
        json={"food_id": food_id, "quantity": 1, "meal_type": meal_type},
        headers={"Authorization": f"Bearer {token}"},
    )


# ══════════════════════════════════════════════════════════════════════════════
# AGENT 1: Food Recommendation Tests
# ══════════════════════════════════════════════════════════════════════════════

MOCK_RECOMMENDATION = (
    "Here are 3 high-protein, low-calorie foods:\n"
    "1. Grilled chicken breast - 165 cal, 31g protein\n"
    "2. Greek yogurt - 100 cal, 17g protein\n"
    "3. Egg whites - 52 cal, 11g protein"
)


def test_recommend_requires_auth(client):
    """Agent 1 should reject unauthenticated requests."""
    response = client.post(
        "/ai/recommend",
        json={"prompt": "high protein foods", "programme": "weight_loss"},
    )
    assert response.status_code == 401


def test_recommend_returns_recommendation(client):
    """Agent 1 should return a recommendation for a valid prompt."""
    token = create_user_and_get_token(client, "recommend1@example.com")

    with patch("app.routers.ai.call_ollama", new_callable=AsyncMock) as mock_ollama:
        mock_ollama.return_value = MOCK_RECOMMENDATION

        response = client.post(
            "/ai/recommend",
            json={"prompt": "high protein low calorie foods", "programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert len(data["recommendation"]) > 0


def test_recommend_passes_programme_context(client):
    """Agent 1 should receive the correct programme in the prompt."""
    token = create_user_and_get_token(client, "recommend2@example.com")

    captured_prompt = {}

    async def capture_ollama(model, prompt):
        captured_prompt["model"] = model
        captured_prompt["prompt"] = prompt
        return MOCK_RECOMMENDATION

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/recommend",
            json={"prompt": "something sweet", "programme": "sodium_watch"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Verificăm că modelul corect e folosit
    assert captured_prompt["model"] == "gemma2:2b"
    # Verificăm că prompt-ul conține cererea userului
    assert "something sweet" in captured_prompt["prompt"]


def test_recommend_works_without_programme(client):
    """Agent 1 should work even if no programme is provided."""
    token = create_user_and_get_token(client, "recommend3@example.com")

    with patch("app.routers.ai.call_ollama", new_callable=AsyncMock) as mock_ollama:
        mock_ollama.return_value = MOCK_RECOMMENDATION

        response = client.post(
            "/ai/recommend",
            json={"prompt": "healthy snack"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert "recommendation" in response.json()


def test_recommend_uses_personalized_targets(client):
    """Agent 1 should use personalized targets when user has body metrics."""
    token = create_user_and_get_token(client, "recommend4@example.com")

    # Set body metrics
    user_response = client.post(
        "/auth/login",
        data={"username": "recommend4@example.com", "password": "test123"},
    )
    user_id = user_response.json()["user"]["id"]

    client.put(
        f"/users/{user_id}",
        json={"weight": 70, "height": 170, "age": 25, "sex": "female", "activity_level": "moderate"},
        headers={"Authorization": f"Bearer {token}"},
    )

    captured_prompt = {}

    async def capture_ollama(model, prompt):
        captured_prompt["prompt"] = prompt
        return MOCK_RECOMMENDATION

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/recommend",
            json={"prompt": "healthy lunch", "programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    # Prompt-ul trebuie să conțină targeturi personalizate (nu cele hardcodate)
    assert "personalized" in captured_prompt.get("prompt", "").lower() or \
           "kcal" in captured_prompt.get("prompt", "")


# ══════════════════════════════════════════════════════════════════════════════
# AGENT 2: Daily Analysis Tests
# ══════════════════════════════════════════════════════════════════════════════

MOCK_ANALYSIS = (
    "Great job logging your meals today! You've consumed 350 calories so far. "
    "Your protein intake is on track at 30g. However, you're low on fiber — "
    "try adding some vegetables or legumes. For dinner, consider grilled salmon "
    "with steamed broccoli to hit your targets. Keep up the good work!"
)


def test_analyze_day_requires_auth(client):
    """Agent 2 should reject unauthenticated requests."""
    response = client.post(
        "/ai/analyze-day",
        json={"programme": "weight_loss"},
    )
    assert response.status_code == 401


def test_analyze_day_no_foods_logged(client):
    """Agent 2 should return a helpful message when no foods are logged."""
    token = create_user_and_get_token(client, "analyze1@example.com")

    response = client.post(
        "/ai/analyze-day",
        json={"date": "2020-01-01", "programme": "weight_loss"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "No foods logged" in data["analysis"]


def test_analyze_day_with_food_log(client):
    """Agent 2 should analyze the day when foods are logged."""
    token = create_user_and_get_token(client, "analyze2@example.com")

    # Adăugăm mâncare în jurnal
    add_food_log(client, token, food_id=1, meal_type="breakfast")
    add_food_log(client, token, food_id=2, meal_type="lunch")

    with patch("app.routers.ai.call_ollama", new_callable=AsyncMock) as mock_ollama:
        mock_ollama.return_value = MOCK_ANALYSIS

        response = client.post(
            "/ai/analyze-day",
            json={"programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert len(data["analysis"]) > 0


def test_analyze_day_uses_correct_model(client):
    """Agent 2 should use llama3.2:1b model."""
    token = create_user_and_get_token(client, "analyze3@example.com")

    add_food_log(client, token, food_id=1, meal_type="lunch")

    captured = {}

    async def capture_ollama(model, prompt):
        captured["model"] = model
        captured["prompt"] = prompt
        return MOCK_ANALYSIS

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/analyze-day",
            json={"programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert captured.get("model") == "llama3.2:1b"


def test_analyze_day_prompt_contains_food_data(client):
    """Agent 2 prompt should contain the actual food log data."""
    token = create_user_and_get_token(client, "analyze4@example.com")

    add_food_log(client, token, food_id=1, meal_type="lunch")

    captured = {}

    async def capture_ollama(model, prompt):
        captured["prompt"] = prompt
        return MOCK_ANALYSIS

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/analyze-day",
            json={"programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    prompt = captured.get("prompt", "")
    # Prompt-ul trebuie să conțină datele din jurnal
    assert "Test Chicken" in prompt
    assert "Consumed so far" in prompt
    assert "Daily targets" in prompt


def test_analyze_day_prompt_contains_water_info(client):
    """Agent 2 prompt should mention water intake."""
    token = create_user_and_get_token(client, "analyze5@example.com")

    add_food_log(client, token, food_id=1, meal_type="lunch")

    captured = {}

    async def capture_ollama(model, prompt):
        captured["prompt"] = prompt
        return MOCK_ANALYSIS

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/analyze-day",
            json={"programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    prompt = captured.get("prompt", "")
    assert "Water intake" in prompt


def test_analyze_day_uses_personalized_targets(client):
    """Agent 2 should use personalized targets when user has body metrics."""
    token = create_user_and_get_token(client, "analyze6@example.com")

    user_response = client.post(
        "/auth/login",
        data={"username": "analyze6@example.com", "password": "test123"},
    )
    user_id = user_response.json()["user"]["id"]

    # Set body metrics
    client.put(
        f"/users/{user_id}",
        json={"weight": 80, "height": 180, "age": 30, "sex": "male", "activity_level": "active"},
        headers={"Authorization": f"Bearer {token}"},
    )

    add_food_log(client, token, food_id=1, meal_type="lunch")

    captured = {}

    async def capture_ollama(model, prompt):
        captured["prompt"] = prompt
        return MOCK_ANALYSIS

    with patch("app.routers.ai.call_ollama", side_effect=capture_ollama):
        client.post(
            "/ai/analyze-day",
            json={"programme": "protein_gain"},
            headers={"Authorization": f"Bearer {token}"},
        )

    prompt = captured.get("prompt", "")
    # Targeturile personalizate trebuie să fie în prompt
    assert "Daily targets" in prompt
    assert "kcal" in prompt


def test_agents_use_different_models(client):
    """Agent 1 and Agent 2 should use different models."""
    token = create_user_and_get_token(client, "models@example.com")
    add_food_log(client, token, food_id=1, meal_type="lunch")

    models_used = []

    async def capture_model(model, prompt):
        models_used.append(model)
        return "mock response"

    with patch("app.routers.ai.call_ollama", side_effect=capture_model):
        # Agent 1
        client.post(
            "/ai/recommend",
            json={"prompt": "healthy food", "programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )
        # Agent 2
        client.post(
            "/ai/analyze-day",
            json={"programme": "weight_loss"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert "gemma2:2b" in models_used
    assert "llama3.2:1b" in models_used
    assert models_used[0] != models_used[1]