from sqlalchemy import text
from app.db import SessionLocal, Base, engine
from app.models.food import Food
from app.models.user import User
from app.models.food_log import FoodLog

#creeaza tabelele daca nu exista
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 1) Golește tabela și resetează ID-urile daca exista deja
db.execute(text("TRUNCATE TABLE foods RESTART IDENTITY CASCADE;"))
db.commit()

# 2) Inserează de la zero
foods = [
    {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3},
    {"name": "Brown Rice", "calories": 123, "protein": 2.7, "carbs": 25.6, "fat": 1},
    {"name": "Banana", "calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3},
    {"name": "Greek Yogurt 2%", "calories": 59, "protein": 10, "carbs": 3.6, "fat": 0.4},
    {"name": "Egg", "calories": 78, "protein": 6, "carbs": 0.6, "fat": 5.3},
    {"name": "Avocado", "calories": 160, "protein": 2, "carbs": 9, "fat": 15},
    {"name": "Oatmeal", "calories": 68, "protein": 2.4, "carbs": 12, "fat": 1.4},
    {"name": "Apple", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2},
    {"name": "Salmon", "calories": 208, "protein": 20, "carbs": 0, "fat": 13},
    {"name": "Broccoli", "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4},
]

for f in foods:
    new_food = Food(**f)
    db.add(new_food)

db.commit()
db.close()
