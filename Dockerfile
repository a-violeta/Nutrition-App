# ---------- FRONTEND BUILD ----------
FROM node:20 AS frontend-build
WORKDIR /app/frontend
# 1. Copiem doar package.json ca să cache-uim instalarea
COPY frontend/package.json frontend/package-lock.json ./

# 2. Instalăm dependențele
RUN npm ci

# 3. Copiem restul codului
COPY frontend .

# 4. Rulăm build-ul
RUN npx --yes vite build

# ---------- BACKEND ----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend .

# Copy frontend build into the location expected by FastAPI
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
