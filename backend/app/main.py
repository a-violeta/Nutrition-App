from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Detectăm dacă suntem în Docker
RUNNING_IN_DOCKER = os.path.exists("/app/frontend/dist")

if RUNNING_IN_DOCKER:
    FRONTEND_DIST = "/app/frontend/dist"
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")

# Servește assets exact cum cere Vite, Vite e ceva prostie de la frontend
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

# Servește index.html pentru ORICE rută care nu este API
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
