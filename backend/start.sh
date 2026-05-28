#!/usr/bin/env bash
set -euo pipefail

echo "Starting cron daemon..."
cron

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
