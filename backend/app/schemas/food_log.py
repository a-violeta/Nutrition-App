from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# 1. Cum arată un Ingredient (pe care îl preluăm din baza de date)
class IngredientSchema(BaseModel):
    id: int
    name: str
    calories_per_100g: float

    model_config = {"from_attributes": True}

# 2. Cum arată legătura dintre mâncare și ingredient (cu tot cu gramaj)
class FoodIngredientSchema(BaseModel):
    amount_g: float
    ingredient: IngredientSchema

    model_config = {"from_attributes": True}

# 3. Mâncarea ta, acum cu lista de ingrediente inclusă
class FoodSchema(BaseModel):
    id: int
    name: str
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    fiber: Optional[float] = 0
    sodium: Optional[float] = 0
    
    # Adaugă această linie:
    meal_tags: Optional[List[str]] = []
    
    # Aceasta este deja:
    ingredients: Optional[List[FoodIngredientSchema]] = []

    model_config = {"from_attributes": True}

class FoodLogCreate(BaseModel):
    food_id: int
    quantity: float = 1.0
    meal_type: str
    date: Optional[str] = None  

class FoodLogResponse(BaseModel):
    id: int
    food_id: int
    user_id: int
    quantity: float
    meal_type: str
    date: date
    food: FoodSchema

    model_config = {"from_attributes": True}