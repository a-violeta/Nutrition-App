from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.models.food import Food
from app.schemas.food_log import FoodSchema

router = APIRouter()


@router.get("/", response_model=List[FoodSchema])
def get_foods(
    search: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db),
):
    """Returns all foods, optionally filtered by name."""
    query = db.query(Food)
    if search:
        query = query.filter(Food.name.ilike(f"%{search}%"))
    return query.all()