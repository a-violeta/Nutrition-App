import os
from fastapi.staticfiles import StaticFiles


def mount_static(app):
    frontend_dist = os.getenv("FRONTEND_DIST")

    # în test mode nu montăm nimic
    if os.getenv("TESTING") == "1":
        return

    if not frontend_dist:
        return

    assets_path = os.path.join(frontend_dist, "assets")

    if os.path.isdir(assets_path):
        app.mount(
            "/assets",
            StaticFiles(directory=assets_path),
            name="assets"
        )