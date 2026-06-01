from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.routers.auth import get_current_user
from app.db import get_db
from app.models.food_log import FoodLog
from app.models.water import WaterLog

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")

# ── Agent 1: Food Recommendation (gemma2:2b) ──────────────────────────────
RECOMMEND_MODEL = "gemma2:2b"

PROGRAMME_CONTEXT = {
    "weight_loss": "The user follows a Weight Loss programme: calorie deficit, balanced macros. Daily targets: 1800 kcal, 90g protein, 200g carbs, 50g fat, 30g fiber.",
    "protein_gain": "The user follows a Protein Gain programme: high protein for muscle building. Daily targets: 2800 kcal, 180g protein, 300g carbs, 80g fat.",
    "glucose_watch": "The user follows a Glucose Watch programme: low carb, high fiber. Daily targets: 2000 kcal, 130g carbs max, 35g fiber.",
    "sodium_watch": "The user follows a Sodium Watch programme: low sodium for heart health. Daily targets: 2000 kcal, 1500mg sodium max.",
}

PROGRAMME_TARGETS = {
    "weight_loss":  {"calories": 1800, "protein": 90,  "carbs": 200, "fat": 50, "fiber": 30,  "sodium": 2300},
    "protein_gain": {"calories": 2800, "protein": 180, "carbs": 300, "fat": 80, "fiber": 25,  "sodium": 2500},
    "glucose_watch":{"calories": 2000, "protein": 100, "carbs": 130, "fat": 70, "fiber": 35,  "sodium": 2300},
    "sodium_watch": {"calories": 2000, "protein": 100, "carbs": 250, "fat": 65, "fiber": 28,  "sodium": 1500},
}

# ── Agent 2: Daily Analysis (llama3.2:1b) ────────────────────────────────
ANALYZE_MODEL = "llama3.2:1b"


class RecommendRequest(BaseModel):
    prompt: str
    programme: Optional[str] = None


class AnalyzeRequest(BaseModel):
    date: Optional[str] = None  # YYYY-MM-DD, default today
    programme: Optional[str] = None


async def call_ollama(model: str, prompt: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={"model": model, "prompt": prompt, "stream": False},
            )
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Ollama error")
            return response.json().get("response", "No response from model.")
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running."
        )


# ── Endpoint Agent 1: /ai/recommend ──────────────────────────────────────
@router.post("/recommend")
async def recommend(
    body: RecommendRequest,
    current_user=Depends(get_current_user),
):
    """Agent 1 (gemma2:2b): Recommends foods based on user preferences."""
    user_targets = current_user.daily_targets
    if user_targets:
        programme_info = (
            f"The user follows the {body.programme or 'general'} programme with these personalized daily targets: "
            f"Calories: {user_targets['calories']} kcal, "
            f"Protein: {user_targets['protein']}g, "
            f"Carbs: {user_targets['carbs']}g, "
            f"Fat: {user_targets['fat']}g, "
            f"Fiber: {user_targets['fiber']}g, "
            f"Sodium: {user_targets['sodium']}mg."
        )
    else:
        programme_info = PROGRAMME_CONTEXT.get(body.programme or "", "")

    system_prompt = f"""You are a nutrition assistant. Your job is to recommend specific foods or meals based on the user's request.
{programme_info}
Keep your answer short and practical — recommend 3-5 specific foods or meals with a brief explanation.
Always respond in the same language the user writes in.
Do not ask follow-up questions. Just recommend foods directly."""

    full_prompt = f"{system_prompt}\n\nUser request: {body.prompt}"
    result = await call_ollama(RECOMMEND_MODEL, full_prompt)
    return {"recommendation": result}


# ── Endpoint Agent 2: /ai/analyze-day ────────────────────────────────────
@router.post("/analyze-day")
async def analyze_day(
    body: AnalyzeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agent 2 (llama3.2:1b): Analyzes the user's food log for a given day."""
    target_date = date.fromisoformat(body.date) if body.date else date.today()

    # 1. Fetch Food Entries
    entries = (
        db.query(FoodLog)
        .filter(
            FoodLog.user_id == current_user.id, 
            func.date(FoodLog.consumed_at) == target_date
        )
        .all()
    )

    if not entries:
        return {"analysis": f"No foods logged for {target_date}. Start logging your meals to get a personalized analysis!"}

    # 2. Fetch Water Entries & Calculate Total Water
    water_entries = (
        db.query(WaterLog)
        .filter(
            WaterLog.user_id == current_user.id,
            func.date(WaterLog.consumed_at) == target_date
        )
        .all()
    )
    
    total_water_ml = sum(entry.amount_ml for entry in water_entries)

    # 3. Calculate Food Totals
    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sodium": 0, "water": total_water_ml}
    meal_list = []
    
    for entry in entries:
        food = entry.food
        qty = entry.serving_amount
        totals["calories"] += (food.calories or 0) * qty
        totals["protein"]  += (food.protein or 0) * qty
        totals["carbs"]    += (food.carbs or 0) * qty
        totals["fat"]      += (food.fat or 0) * qty
        totals["fiber"]    += (food.fiber or 0) * qty
        totals["sodium"]   += (food.sodium or 0) * qty
        meal_list.append(f"- {food.name} (x{qty}) [{entry.logged_meal}]")

    meals_str = "\n".join(meal_list)

    consumed_str = (
        f"Calories: {round(totals['calories'])} kcal | "
        f"Protein: {round(totals['protein'])}g | "
        f"Carbs: {round(totals['carbs'])}g | "
        f"Fat: {round(totals['fat'])}g | "
        f"Fiber: {round(totals['fiber'])}g | "
        f"Sodium: {round(totals['sodium'])}mg | "
        f"Water intake: {totals['water']} ml" 
    )

    # 4. Determine Targets (Dynamic Water Target)
    if current_user.weight:
        water_target_ml = int(current_user.weight * 35)
    else:
        water_target_ml = 2000

    water_intake_ml = total_water_ml

    user_targets = current_user.daily_targets
    if user_targets:
        targets_str = (
            f"Calories: {user_targets['calories']} kcal | "
            f"Protein: {user_targets['protein']}g | "
            f"Carbs: {user_targets['carbs']}g | "
            f"Fat: {user_targets['fat']}g | "
            f"Fiber: {user_targets['fiber']}g | "
            f"Sodium: {user_targets['sodium']}mg | "
            f"Water: {water_target_ml} ml" 
        )
    else:
        targets = PROGRAMME_TARGETS.get(body.programme or "", PROGRAMME_TARGETS["weight_loss"])
        targets_str = (
            f"Calories: {targets['calories']} kcal | "
            f"Protein: {targets['protein']}g | "
            f"Carbs: {targets['carbs']}g | "
            f"Fat: {targets['fat']}g | "
            f"Fiber: {targets['fiber']}g | "
            f"Sodium: {targets['sodium']}mg | "
            f"Water: {water_target_ml} ml" 
        )

    system_prompt = f"""You are a personal nutritionist AI. Analyze the user's food and water log for today and give personalized, actionable feedback.

User: {current_user.name}
Programme: {body.programme or "general"}
Date: {target_date}

Daily targets: {targets_str}
Consumed so far: {consumed_str}

Foods eaten today:
{meals_str}

Water intake today: {water_intake_ml}ml (recommended target based on weight: {water_target_ml}ml/day)

Your task:
1. Comment on what they did well today
2. Point out any nutrients that are too low or too high compared to targets
3. Give 2-3 specific suggestions for the rest of the day
4. Keep it friendly, motivating and concise (max 150 words)
5. Always respond in English"""

    result = await call_ollama(ANALYZE_MODEL, system_prompt)
    return {"analysis": result}