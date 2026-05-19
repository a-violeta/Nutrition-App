import sys
from pathlib import Path
import os

os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["FRONTEND_DIST"] = ""  # IMPORTANT

# adaugă backend/ în PYTHONPATH
sys.path.append(str(Path(__file__).resolve().parents[1]))

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret-key"

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import Base, get_db
from app.models.food import Food

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    db = TestingSessionLocal()

    # seed foods
    if not db.query(Food).first():
        db.add_all([
            Food(
                id=1,
                name="Test Chicken",
                calories=200,
                protein=30,
                carbs=0,
                fat=5,
                fiber=0,
                sodium=100,
            ),
            Food(
                id=2,
                name="Test Rice",
                calories=150,
                protein=3,
                carbs=30,
                fat=1,
                fiber=1,
                sodium=10,
            ),
        ])
        db.commit()

    db.close()

    with TestClient(app) as c:
        yield c