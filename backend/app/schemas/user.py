from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    """Schema pentru răspuns — ce returnăm clientului (fără parolă!)"""
    id: int
    name: str
    email: str
    photo_url: Optional[str] = None
    created_at: datetime
    programme: Optional[str] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Schema pentru PUT — toate câmpurile opționale"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    password: Optional[str] = None  # dacă vrea să schimbe parola