from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from app.routers.auth import get_current_user

router = APIRouter()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")
MODEL = "gemma2:2b"

PROGRAMME_CONTEXT = {
    "weight_loss": "The user follows a Weight Loss programme: calorie deficit, balanced macros. Daily targets: 1800 kcal, 90g protein, 200g carbs, 50g fat, 30g fiber.",
    "protein_gain": "The user follows a Protein Gain programme: high protein for muscle building. Daily targets: 2800 kcal, 180g protein, 300g carbs, 80g fat.",
    "glucose_watch": "The user follows a Glucose Watch programme: low carb, high fiber. Daily targets: 2000 kcal, 130g carbs max, 35g fiber.",
    "sodium_watch": "The user follows a Sodium Watch programme: low sodium for heart health. Daily targets: 2000 kcal, 1500mg sodium max.",
}


class RecommendRequest(BaseModel):
    prompt: str
    programme: Optional[str] = None


@router.post("/recommend")
async def recommend(
    body: RecommendRequest,
    current_user=Depends(get_current_user),
):
    programme_info = PROGRAMME_CONTEXT.get(body.programme or "", "")

    system_prompt = f"""You are a nutrition assistant. Your job is to recommend specific foods or meals based on the user's request.
{programme_info}
Keep your answer short and practical — recommend 3-5 specific foods or meals with a brief explanation.
Always respond in the same language the user writes in.
Do not ask follow-up questions. Just recommend foods directly."""

    full_prompt = f"{system_prompt}\n\nUser request: {body.prompt}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "prompt": full_prompt,
                    "stream": False,
                },
            )
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Ollama error")

            data = response.json()
            return {"recommendation": data.get("response", "No response from model.")}

    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running. Start it with: ollama serve"
        )