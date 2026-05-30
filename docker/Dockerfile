FROM python:3.11-slim

WORKDIR /app

# dependinte
COPY backend/requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends cron curl && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# cod backend
COPY backend /app/backend

# frontend deja construit
# ruleaza comanda npm run build înfrontend
COPY frontend/dist /app/frontend/dist

RUN chmod +x /app/backend/send_daily_reminders.sh /app/backend/start.sh
RUN crontab /app/backend/reminder.cron
RUN sed -i 's/\r//' /app/backend/start.sh
RUN sed -i 's/\r//' /app/backend/send_daily_reminders.sh

# runtime
WORKDIR /app/backend

EXPOSE 8000

CMD ["/app/backend/start.sh"]
