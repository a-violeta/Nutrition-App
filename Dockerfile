# ---------- FRONTEND BUILD ----------
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npx vite build

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
