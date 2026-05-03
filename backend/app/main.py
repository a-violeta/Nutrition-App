from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db import init_db
from app.routers.users import router as users_router
import os

app = FastAPI()

# Creează tabelele la startup
@app.on_event("startup")
def on_startup():
    init_db()

# Detectăm dacă suntem în Docker
RUNNING_IN_DOCKER = os.path.exists("/app/frontend/dist")

if RUNNING_IN_DOCKER:
    FRONTEND_DIST = "/app/frontend/dist"
else:
    #BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    #FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")
    FRONTEND_DIST = None
    # În local, dist nu există → frontend rulează pe 8080

# CORS doar în local (când frontend-ul rulează separat)
if not RUNNING_IN_DOCKER:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:8000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# API
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users", tags=["users"])

# Servește assets exact cum cere Vite, Vite e ceva prostie de la frontend
#app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

# Dacă suntem în Docker → servim frontend-ul build-uit
if RUNNING_IN_DOCKER:
    # Servește assets
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets") # type: ignore

    # Servește index.html pentru orice rută non-API
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html")) # type: ignore

# e ok sa aiba erori, e prost pylance, aplicatia merge si asa