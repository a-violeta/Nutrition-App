# ---------- FINAL IMAGE ----------
FROM python:3.11-slim
WORKDIR /app/backend

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend .

# Copy prebuilt frontend
COPY ../frontend/dist ../frontend/dist

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]