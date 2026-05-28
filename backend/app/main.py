from fastapi import FastAPI, HTTPException
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.food_log import router as food_log_router
from app.routers.push import router as push_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db import init_db, SessionLocal
import os
from starlette.staticfiles import StaticFiles
from app.static import mount_static
from app.routers.ai import router as ai_router
from app.routers.foods import router as foods_router

app = FastAPI()

app.include_router(ai_router, prefix="/ai")

mount_static(app)

# FRONTEND_DIST = "/app/frontend/dist"
# testele unitare CI/CD nu gasesc nimic ce tine de docker, deci nu gasesc FRONTEND_DIST
FRONTEND_DIST = os.getenv("FRONTEND_DIST")

from app.seeds.init_foods import seed_foods

# Creează tabelele și populează foods la startup
@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        #print("ABOUT TO RUN FOOD SEED")
        seed_foods(db)

        #foods = db.query(Food).all()
        #print("INSERTED FOODS:")
        #for food in foods:
            #print(food.name)
    finally:
        db.close()

# Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(food_log_router, prefix="/food-log")
app.include_router(foods_router, prefix="/foods")
app.include_router(push_router, prefix="/push")


# Servește frontend-ul în Docker
# app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

@app.get("/sw.js")
def service_worker():
    if not FRONTEND_DIST:
        raise HTTPException(status_code=404, detail="Service worker not available")
    return FileResponse(f"{FRONTEND_DIST}/sw.js")

#SPA fallback
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse(f"{FRONTEND_DIST}/index.html")