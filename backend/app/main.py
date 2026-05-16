from fastapi import FastAPI, Request
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.food_log import router as food_log_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db import init_db, SessionLocal
from app.models.food import Food

app = FastAPI()

FRONTEND_DIST = "/app/frontend/dist"

MOCK_FOODS = [
    {"id": 1,  "name": "Grilled Chicken Breast",  "calories": 165, "protein": 31,  "carbs": 0,  "fat": 3.6, "fiber": 0,   "sodium": 74},
    {"id": 2,  "name": "Brown Rice (1 cup)",       "calories": 216, "protein": 5,   "carbs": 45, "fat": 1.8, "fiber": 3.5, "sodium": 10},
    {"id": 3,  "name": "Banana",                   "calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "fiber": 3.1, "sodium": 1},
    {"id": 4,  "name": "Greek Yogurt",             "calories": 100, "protein": 17,  "carbs": 6,  "fat": 0.7, "fiber": 0,   "sodium": 36},
    {"id": 5,  "name": "Salmon Fillet",            "calories": 208, "protein": 20,  "carbs": 0,  "fat": 13,  "fiber": 0,   "sodium": 59},
    {"id": 6,  "name": "Avocado (half)",           "calories": 120, "protein": 1.5, "carbs": 6,  "fat": 11,  "fiber": 5,   "sodium": 5},
    {"id": 7,  "name": "Egg (boiled)",             "calories": 78,  "protein": 6,   "carbs": 0.6,"fat": 5,   "fiber": 0,   "sodium": 62},
    {"id": 8,  "name": "Oatmeal (1 cup)",          "calories": 154, "protein": 5,   "carbs": 27, "fat": 2.6, "fiber": 4,   "sodium": 2},
    {"id": 9,  "name": "Spinach (100g)",           "calories": 23,  "protein": 2.9, "carbs": 3.6,"fat": 0.4, "fiber": 2.2, "sodium": 79},
    {"id": 10, "name": "Sweet Potato",             "calories": 103, "protein": 2.3, "carbs": 24, "fat": 0.1, "fiber": 3.8, "sodium": 41},
    {"id": 11, "name": "Almonds (28g)",            "calories": 164, "protein": 6,   "carbs": 6,  "fat": 14,  "fiber": 3.5, "sodium": 1},
    {"id": 12, "name": "Whole Wheat Bread",        "calories": 69,  "protein": 3.6, "carbs": 12, "fat": 1,   "fiber": 1.9, "sodium": 132},
]

# Creează tabelele și populează foods la startup
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        if db.query(Food).count() == 0:
            for f in MOCK_FOODS:
                db.add(Food(**f))
            db.commit()
    finally:
        db.close()

# Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(food_log_router, prefix="/food-log")

# Servește frontend-ul în Docker
app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

#SPA fallback
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse(f"{FRONTEND_DIST}/index.html")