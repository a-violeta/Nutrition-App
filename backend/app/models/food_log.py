from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base
import datetime

class FoodLog(Base):
    __tablename__ = "food_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    date = Column(Date, nullable=False, default=datetime.date.today)

    user = relationship("User", backref="food_logs")
    food = relationship("Food", backref="food_logs")