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

from app.seeds.init_foods import seed_foods

# Creează tabelele și populează foods la startup
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        print("ABOUT TO RUN FOOD SEED")
        seed_foods(db)

        foods = db.query(Food).all()
        print("INSERTED FOODS:")
        for food in foods:
            print(food.name)
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