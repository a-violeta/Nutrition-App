from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.db import get_db
from app.models.food_log import FoodLog
from app.models.food import Food
from app.routers.auth import get_current_user
from app.schemas.food_log import FoodLogCreate, FoodLogResponse

router = APIRouter()

@router.get("/foods")
def get_foods(db: Session = Depends(get_db)):
    foods = db.query(Food).all()

    print("=== FOODS FROM DB ===")
    for f in foods:
        print(f.id, f.name)

    return db.query(Food).all()

@router.get("/", response_model=List[FoodLogResponse])
def get_food_log(
    log_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD). Default: today."),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns food log for the current user on a given date (default: today)."""
    target_date = log_date or date.today()
    entries = (
        db.query(FoodLog)
        .filter(FoodLog.user_id == current_user.id, FoodLog.date == target_date)
        .all()
    )
    return entries


@router.post("/", response_model=FoodLogResponse, status_code=status.HTTP_201_CREATED)
def add_food_log(
    entry: FoodLogCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Adds a food entry to the current user's log."""
    food = db.query(Food).filter(Food.id == entry.food_id).first()
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food with id {entry.food_id} not found."
        )

    log_entry = FoodLog(
        user_id=current_user.id,
        food_id=entry.food_id,
        quantity=entry.quantity,
        meal_type=entry.meal_type,
        date=date.fromisoformat(entry.date) if entry.date else date.today(),
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log(
    entry_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a food log entry. Only the owner can delete their entries."""
    entry = db.query(FoodLog).filter(FoodLog.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log entry with id {entry_id} not found."
        )
    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this entry."
        )
    db.delete(entry)
    db.commit()
    return None