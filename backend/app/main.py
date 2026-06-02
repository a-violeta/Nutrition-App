from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager  # <-- IMPORT NOU ADAUGAT AICI
import os

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.food_log import router as food_log_router
from app.routers.push import router as push_router
from app.routers.ai import router as ai_router
from app.routers.foods import router as foods_router
from app.routers import water

from app.db import init_db, SessionLocal
from app.static import mount_static
from app.seeds.init_foods import seed_foods
from fastapi.middleware.cors import CORSMiddleware


# ── MODIFICARE: Definirea funcției lifespan ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tot ce este înainte de 'yield' se execută la STARTUP
    init_db()
    db = SessionLocal()
    try:
        # print("ABOUT TO RUN FOOD SEED")
        seed_foods(db)

        # foods = db.query(Food).all()
        # print("INSERTED FOODS:")
        # for food in foods:
        #     print(food.name)
    finally:
        db.close()
        
    yield  # Aici rulează aplicația propriu-zisă
    
    # Tot ce ar fi după 'yield' se execută la SHUTDOWN (curățenie, închidere conexiuni etc.)


# ── MODIFICARE: Atribuirea lifespan-ului la aplicație ──
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # În producție poți pune link-ul exact al site-ului tău Railway
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# FRONTEND_DIST = "/app/frontend/dist"
# testele unitare CI/CD nu gasesc nimic ce tine de docker, deci nu gasesc FRONTEND_DIST
FRONTEND_DIST = os.getenv("FRONTEND_DIST")

# Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(food_log_router, prefix="/food-log")
app.include_router(foods_router, prefix="/foods")
app.include_router(push_router, prefix="/push")
app.include_router(ai_router, prefix="/ai")
app.include_router(water.router, prefix="/water")

mount_static(app)

# Servește frontend-ul în Docker
# app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

@app.get("/sw.js")
def service_worker():
    if not FRONTEND_DIST:
        raise HTTPException(status_code=404, detail="Service worker not available")
    return FileResponse(f"{FRONTEND_DIST}/sw.js")

# SPA fallback
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    # Nu servi frontend pentru rute API (AM ADĂUGAT ȘI "water" AICI)
    api_prefixes = ("auth", "users", "food-log", "foods", "push", "ai", "water")
    if any(full_path.startswith(prefix) for prefix in api_prefixes):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(f"{FRONTEND_DIST}/index.html")
