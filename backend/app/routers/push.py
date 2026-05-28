import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.push_service import VAPID_PUBLIC_KEY, send_web_push

router = APIRouter()

REMINDER_SECRET = os.getenv("REMINDER_SECRET")


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


@router.get("/vapid-public-key")
def get_vapid_public_key():
    return {"publicKey": VAPID_PUBLIC_KEY}


@router.post("/subscribe")
def subscribe_push(
    subscription: PushSubscription,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.push_subscription = subscription.model_dump_json()
    db.commit()
    return {"success": True, "notifications_enabled": current_user.notifications_enabled}


@router.post("/unsubscribe")
def unsubscribe_push(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.push_subscription = None
    db.commit()
    return {"success": True, "notifications_enabled": False}


class PushReminderRequest(BaseModel):
    title: str = "NutriTrack Reminder"
    body: str = "Don't forget to log your meals and keep your nutrition on track today!"
    url: str = "/"


class PushReminderRequest(BaseModel):
    title: str = "NutriTrack Reminder"
    body: str = "Don't forget to log your meals and keep your nutrition on track today!"
    url: str = "/"


@router.post("/send-test")
def send_test_notification(
    current_user: User = Depends(get_current_user),
):
    if not current_user.push_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No push subscription registered.",
        )

    send_web_push(
        current_user.push_subscription,
        {
            "title": "NutriTrack Notification",
            "body": "This is a test push notification from NutriTrack.",
            "url": "/",
        },
    )
    return {"success": True}


@router.post("/send-daily-reminders")
def send_daily_reminders(
    reminder: PushReminderRequest,
    x_reminder_secret: str = Header(..., alias="X-Reminder-Secret"),
    db: Session = Depends(get_db),
):
    if not REMINDER_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Reminder secret is not configured.",
        )
    if x_reminder_secret != REMINDER_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid reminder secret.",
        )

    users = db.query(User).filter(User.push_subscription.isnot(None)).all()
    sent = 0
    failed = []

    for user in users:
        try:
            send_web_push(
                user.push_subscription,
                {
                    "title": reminder.title,
                    "body": reminder.body,
                    "url": reminder.url,
                },
            )
            sent += 1
        except Exception:
            failed.append(user.email)

    return {
        "success": True,
        "sent": sent,
        "failed": failed,
    }


@router.post("/send-daily-reminders")
def send_daily_reminders(
    reminder: PushReminderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.push_subscription.isnot(None)).all()
    sent = 0
    failed = []

    for user in users:
        try:
            send_web_push(
                user.push_subscription,
                {
                    "title": reminder.title,
                    "body": reminder.body,
                    "url": reminder.url,
                },
            )
            sent += 1
        except Exception:
            failed.append(user.email)

    return {
        "success": True,
        "sent": sent,
        "failed": failed,
    }
