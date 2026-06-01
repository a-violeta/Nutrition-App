from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

from app.db import get_db 
from app.models.water import WaterLog
from app.routers.auth import get_current_user 

router = APIRouter()

# 1. Creăm schema pentru a putea primi data prin JSON din frontend
class WaterCreate(BaseModel):
    amount_ml: int
    consumed_at: Optional[datetime] = None

@router.post("/", response_model=dict)
def add_water(water_data: WaterCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Dacă frontend-ul trimite consumed_at (ex. pentru ieri), o va folosi pe aia. 
    # Dacă nu trimite nimic (None), baza de date va pune func.now() automat.
    new_log = WaterLog(
        user_id=current_user.id, 
        amount_ml=water_data.amount_ml,
        consumed_at=water_data.consumed_at 
    )
    db.add(new_log)
    db.commit()
    return {"message": f"Ai adaugat {water_data.amount_ml} ml cu succes!"}

@router.get("/today", response_model=dict)
def get_water_today(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total = db.query(func.sum(WaterLog.amount_ml)).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == func.current_date()
    ).scalar()
    return {"total_ml": total or 0}

@router.delete("/undo", response_model=dict)
def undo_last_water(target_date: date, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Căutăm cea mai recentă înregistrare de apă pentru DATA PRIMITĂ, nu doar pentru azi
    last_log = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == target_date
    ).order_by(WaterLog.consumed_at.desc()).first()

    if not last_log:
        raise HTTPException(status_code=404, detail="Nu există apă adăugată în această zi pentru a o șterge.")

    db.delete(last_log)
    db.commit()
    return {"message": f"Am anulat ultima intrare ({last_log.amount_ml} ml)."}

# Ruta pentru Dashboard și Weekly Progress rămâne perfectă!
@router.get("/daily", response_model=dict)
def get_water_by_date(date: date, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total = db.query(func.sum(WaterLog.amount_ml)).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == date
    ).scalar()
    
    return {"total_ml": total or 0}