from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.db import get_db 
from app.models.water import WaterLog
from app.routers.auth import get_current_user 

router = APIRouter()

@router.post("/", response_model=dict)
def add_water(amount_ml: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_log = WaterLog(user_id=current_user.id, amount_ml=amount_ml)
    db.add(new_log)
    db.commit()
    return {"message": f"Ai adaugat {amount_ml} ml cu succes!"}

@router.get("/today", response_model=dict)
def get_water_today(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total = db.query(func.sum(WaterLog.amount_ml)).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == func.current_date()
    ).scalar()
    return {"total_ml": total or 0}

# 🆕 RUTA NOUĂ PENTRU UNDO
@router.delete("/undo", response_model=dict)
def undo_last_water(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Căutăm cea mai recentă înregistrare de apă de azi a utilizatorului
    last_log = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        cast(WaterLog.consumed_at, Date) == func.current_date()
    ).order_by(WaterLog.consumed_at.desc()).first()

    if not last_log:
        raise HTTPException(status_code=404, detail="Nu există apă adăugată astăzi pentru a o șterge.")

    db.delete(last_log)
    db.commit()
    return {"message": f"Am anulat ultima intrare ({last_log.amount_ml} ml)."}