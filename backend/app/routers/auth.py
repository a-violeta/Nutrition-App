from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone  # <-- Importuri consolidate aici
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()

class ProgrammeUpdate(BaseModel):
    programme: Optional[str] = None

# -----------------------------
# CONFIG
# -----------------------------
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in environment variables")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# -----------------------------
# UTILS
# -----------------------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    # <-- FIX: Folosim timezone.utc în loc de utcnow() care e depreciat
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore


# -----------------------------
# REGISTER
# -----------------------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    photo_url: str | None = None

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        photo_url=data.photo_url,
        created_at=datetime.now(timezone.utc),  # Aici aveai deja FIX-ul corect!
        programme=None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # generăm token imediat după înregistrare
    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)  # <-- FIX: model_validate în loc de from_orm
    }

# -----------------------------
# LOGIN
# -----------------------------
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    stored_password: str = user.hashed_password  # type: ignore
    if not verify_password(form_data.password, stored_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id: int = user.id  # type: ignore
    token = create_access_token({"sub": str(user_id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)  # <-- FIX Pydantic V2
    }

# -----------------------------
# CURRENT USER
# -----------------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = int(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)  # <-- FIX Pydantic V2

@router.put("/programme")
def update_programme(
    data: ProgrammeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.programme = data.programme # type: ignore
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)  # <-- FIX Pydantic V2