from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.db import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    photo_url = Column(Text, nullable=True)
    push_subscription = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    programme = Column(String, nullable=True)

    # Date fizice pentru calculul caloriilor
    weight = Column(Float, nullable=True)       # kg
    height = Column(Float, nullable=True)       # cm
    age = Column(Integer, nullable=True)        # ani
    sex = Column(String, nullable=True)         # "male" / "female"
    activity_level = Column(String, nullable=True)  # sedentary / light / moderate / active

    @property
    def notifications_enabled(self) -> bool:
        return bool(self.push_subscription)

    @property
    def daily_calories(self) -> int:
        """Mifflin-St Jeor formula"""
        if not all([self.weight, self.height, self.age, self.sex]):
            return None

        if self.sex == "male":
            bmr = (10 * self.weight) + (6.25 * self.height) - (5 * self.age) + 5
        else:
            bmr = (10 * self.weight) + (6.25 * self.height) - (5 * self.age) - 161

        activity_factors = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
        }
        factor = activity_factors.get(self.activity_level or "sedentary", 1.2)
        return round(bmr * factor)

    @property
    def daily_targets(self) -> dict:
        """Calculează targeturile nutriționale în funcție de program și date fizice."""
        calories = self.daily_calories

        programme_targets = {
            "weight_loss": {
                "calories": round(calories * 0.8) if calories else 1800,
                "protein": round((calories * 0.30) / 4) if calories else 90,
                "carbs": round((calories * 0.40) / 4) if calories else 200,
                "fat": round((calories * 0.30) / 9) if calories else 50,
                "fiber": 30,
                "sodium": 2300,
            },
            "protein_gain": {
                "calories": round(calories * 1.1) if calories else 2800,
                "protein": round((calories * 0.35) / 4) if calories else 180,
                "carbs": round((calories * 0.45) / 4) if calories else 300,
                "fat": round((calories * 0.20) / 9) if calories else 80,
                "fiber": 25,
                "sodium": 2500,
            },
            "glucose_watch": {
                "calories": calories or 2000,
                "protein": round((calories * 0.30) / 4) if calories else 100,
                "carbs": round((calories * 0.25) / 4) if calories else 130,
                "fat": round((calories * 0.45) / 9) if calories else 70,
                "fiber": 35,
                "sodium": 2300,
            },
            "sodium_watch": {
                "calories": calories or 2000,
                "protein": round((calories * 0.25) / 4) if calories else 100,
                "carbs": round((calories * 0.50) / 4) if calories else 250,
                "fat": round((calories * 0.25) / 9) if calories else 65,
                "fiber": 28,
                "sodium": 1500,
            },
        }

        return programme_targets.get(self.programme or "weight_loss", programme_targets["weight_loss"])