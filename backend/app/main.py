from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.food_log import router as food_log_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db import SessionLocal
from app.models.food import Food
import os

app = FastAPI()

# Detectăm dacă suntem în Docker
RUNNING_IN_DOCKER = os.path.exists("/app/frontend/dist")

if RUNNING_IN_DOCKER:
    FRONTEND_DIST = "/app/frontend/dist"
else:
    FRONTEND_DIST = None

# CORS doar în local
if not RUNNING_IN_DOCKER:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:8000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(food_log_router, prefix="/food-log")

# Servește frontend-ul în Docker
if RUNNING_IN_DOCKER:
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets") #type: ignore

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html")) # type: ignore