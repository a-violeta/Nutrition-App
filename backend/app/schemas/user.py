from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime


class UserResponse(BaseModel):
    """Schema pentru răspuns — ce returnăm clientului (fără parolă!)"""
    id: int
    name: str
    email: str
    photo_url: Optional[str] = None
    created_at: datetime
    programme: Optional[str] = None
    notifications_enabled: bool = False

    # Date fizice
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    activity_level: Optional[str] = None

    # Targeturi calculate
    daily_calories: Optional[int] = None
    daily_targets: Optional[Dict[str, float]] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Schema pentru PUT — toate câmpurile opționale"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    password: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[str] = None          # "male" / "female"
    activity_level: Optional[str] = None  # sedentary / light / moderate / active