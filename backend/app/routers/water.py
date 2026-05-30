from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

# Importăm conexiunea la baza de date și modelul
from app.db import get_db 
from app.models.water import WaterLog

# 1. AICI ESTE IMPORTUL LIPSĂ PENTRU AUTENTIFICARE:
from app.routers.auth import get_current_user 

router = APIRouter()

# 2. Ruta pentru a adăuga apă
@router.post("/", response_model=dict)
def add_water(amount_ml: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # 3. Nu mai hardcodăm! Folosim ID-ul utilizatorului logat:
    new_log = WaterLog(user_id=current_user.id, amount_ml=amount_ml)
    db.add(new_log)
    db.commit()
    return {"message": f"Ai adaugat {amount_ml} ml cu succes!"}

# 4. Ruta pentru a citi totalul de apă băut astăzi (Am șters dublura)
@router.get("/today", response_model=dict)
def get_water_today(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Lăsăm PostgreSQL să își folosească propriul ceas intern (current_date)
    total = db.query(func.sum(WaterLog.amount_ml)).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == func.current_date()
    ).scalar()
    
    return {"total_ml": total or 0}