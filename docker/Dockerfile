FROM python:3.11-slim

WORKDIR /app

# dependinte
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# cod backend
COPY backend /app/backend

# frontend deja construit
# ruleaza comanda npm run build în frontend
COPY frontend/dist /app/frontend/dist

# runtime
WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
