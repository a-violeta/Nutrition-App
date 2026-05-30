from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Returnează profilul unui utilizator după ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Utilizatorul cu id {user_id} nu a fost găsit."
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):
    """Actualizează profilul unui utilizator. Doar câmpurile trimise sunt modificate."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Utilizatorul cu id {user_id} nu a fost găsit."
        )

    # Dacă se trimite un email nou, verificăm să nu fie deja folosit
    if updates.email and updates.email != user.email:
        existing = db.query(User).filter(User.email == updates.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Emailul este deja folosit de alt cont."
            )
        user.email = updates.email # type: ignore

    if updates.name is not None:
        user.name = updates.name # type: ignore

    if updates.photo_url is not None:
        user.photo_url = updates.photo_url if updates.photo_url != "" else None # type: ignore

    # Dacă vrea să schimbe parola, o hash-uim
    if updates.password is not None:
        user.hashed_password = pwd_context.hash(updates.password) #type: ignore
    
    if updates.weight is not None:
        user.weight = updates.weight  # type: ignore

    if updates.height is not None:
        user.height = updates.height  # type: ignore

    if updates.age is not None:
        user.age = updates.age  # type: ignore

    if updates.sex is not None:
        user.sex = updates.sex  # type: ignore

    if updates.activity_level is not None:
        user.activity_level = updates.activity_level  # type: ignore

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Șterge un utilizator după ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Utilizatorul cu id {user_id} nu a fost găsit."
        )
    db.delete(user)
    db.commit()
    return None