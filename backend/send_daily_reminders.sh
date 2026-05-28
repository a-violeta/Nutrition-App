#!/usr/bin/env bash
set -euo pipefail

if [ -z "${REMINDER_SECRET:-}" ]; then
  echo "REMINDER_SECRET is not set"
  exit 1
fi

curl --retry 3 --retry-delay 5 --silent --show-error \
  -X POST "http://127.0.0.1:8000/push/send-daily-reminders" \
  -H "Content-Type: application/json" \
  -H "X-Reminder-Secret: ${REMINDER_SECRET}" \
  -d '{"title":"Daily NutriTrack Reminder","body":"Don\'t forget to log your meals today!","url":"/"}'
