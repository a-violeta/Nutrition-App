from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
from app.db import get_db
from app.models.food_log import FoodLog
from app.models.food import Food
from app.routers.auth import get_current_user
from app.schemas.food_log import FoodLogCreate, FoodLogResponse
from app.services.push_service import send_web_push

router = APIRouter()

@router.get("/foods")
def get_foods(db: Session = Depends(get_db)):
    foods = db.query(Food).all()

    print("=== FOODS FROM DB ===")
    for f in foods:
        print(f.id, f.name)

    return foods

@router.get("/", response_model=List[FoodLogResponse])
def get_food_log(
    log_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD). Default: today."),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns food log for the current user on a given date (default: today)."""
    target_date = log_date or date.today()
    
    # 1. TRADUCERE: Căutăm folosind `func.date()` pentru că `consumed_at` este un DateTime
    entries = (
        db.query(FoodLog)
        .filter(FoodLog.user_id == current_user.id, func.date(FoodLog.consumed_at) == target_date)
        .all()
    )
    
    # 2. TRADUCERE: Transformăm rezultatele SQL în formatul Pydantic pe care îl știe React
    result = []
    for e in entries:
        result.append({
            "id": e.id,
            "food_id": e.food_id,
            "user_id": e.user_id,
            "quantity": e.serving_amount,   # Din DB in Schema
            "meal_type": e.logged_meal,     # Din DB in Schema
            "date": e.consumed_at.date(),   # Extragem doar data din timestamp
            "food": e.food
        })
        
    return result


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

    # Convertim string-ul de dată primit de la Frontend într-un obiect DateTime real
    if entry.date:
        try:
            target_date = datetime.strptime(entry.date, "%Y-%m-%d")
        except ValueError:
            target_date = datetime.now()
    else:
        target_date = datetime.now()

    # 1. TRADUCERE: Salvăm în baza de date cu coloanele reale din SQLAlchemy
    log_entry = FoodLog(
        user_id=current_user.id,
        food_id=entry.food_id,
        serving_amount=entry.quantity, # Frontend quantity -> DB serving_amount
        logged_meal=entry.meal_type,   # Frontend meal_type -> DB logged_meal
        consumed_at=target_date,       # Frontend date -> DB consumed_at
    )
    
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # Notificările tale Push
    if current_user.push_subscription:
        try:
            send_web_push(
                current_user.push_subscription,
                {
                    "title": "NutriTrack",
                    "body": f"{food.name} logged to your {entry.meal_type}.",
                    "url": "/",
                },
            )
        except Exception:
            pass

    # 2. TRADUCERE: Returnăm datele spre Frontend cu numele pe care Pydantic le așteaptă
    return {
        "id": log_entry.id,
        "food_id": log_entry.food_id,
        "user_id": log_entry.user_id,
        "quantity": log_entry.serving_amount,
        "meal_type": log_entry.logged_meal,
        "date": log_entry.consumed_at.date(),
        "food": log_entry.food
    }


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