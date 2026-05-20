from sqlalchemy.orm import Session
from app.models.food import Food
from app.seeds.foods import FOOD_SEED

def seed_foods(db: Session):
    if db.query(Food).count() > 0:
        return

    for food in FOOD_SEED:
        db.add(Food(**food))

    db.commit()