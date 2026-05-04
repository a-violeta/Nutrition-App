from pydantic import BaseModel
from typing import Optional
from datetime import date
from typing import Optional, Union


class FoodSchema(BaseModel):
    id: int
    name: str
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    fiber: Optional[float] = 0
    sodium: Optional[float] = 0

    model_config = {"from_attributes": True}


class FoodLogCreate(BaseModel):
    food_id: int
    quantity: float = 1.0
    meal_type: str
    date: Optional[str] = None  # primim string, convertim în router


class FoodLogResponse(BaseModel):
    id: int
    food_id: int
    user_id: int
    quantity: float
    meal_type: str
    date: date
    food: FoodSchema

    model_config = {"from_attributes": True}