# ---------- BACKEND ----------
FROM python:3.11-slim AS backend
WORKDIR /app/backend

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend .

# ---------- FINAL IMAGE ----------
FROM python:3.11-slim
WORKDIR /app

# Copy backend from build stage
COPY --from=backend /app/backend ./backend

# Copy prebuilt frontend (dist must exist in repo)
COPY frontend/dist ./frontend/dist

# Expose port
EXPOSE 8000

WORKDIR /app/backend
# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
