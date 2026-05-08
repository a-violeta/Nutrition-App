from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.food import Food

router = APIRouter(
    prefix="/foods",
    tags=["foods"]
)

@router.get("/")
def search_foods(query: str = "", db: Session = Depends(get_db)):
    foods = (
        db.query(Food)
        .filter(Food.name.ilike(f"%{query}%"))
        .limit(20)
        .all()
    )
    return foods
