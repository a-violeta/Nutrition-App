import json
import os
from typing import Any

from pywebpush import WebPushException, webpush

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_CLAIMS = {
    "sub": os.getenv("VAPID_CLAIMS_SUB", "mailto:admin@nutritrack.app")
}

if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY:
    raise RuntimeError("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables must be set.")


def send_web_push(subscription_json: str, payload: dict[str, Any]) -> None:
    subscription_data = json.loads(subscription_json)
    try:
        webpush(
            subscription_data,
            json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS,
        )
    except WebPushException as exc:
        raise RuntimeError(f"Web push failed: {exc}") from exc
