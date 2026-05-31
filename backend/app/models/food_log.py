from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Importul bazei tale de date
from app.db import Base

class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    # Relația cu utilizatorul (presupunând că tabelul de useri se numește 'users')
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Relația cu mâncarea
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False)
    
    # Preia automat data și ora exactă a consumului
    consumed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    logged_meal = Column(String, nullable=False)
    serving_amount = Column(Float, nullable=False)

    # Datorită modului în care funcționează SQLAlchemy, poți scrie direct "Food" ca string,
    # iar el va ști să facă legătura cu clasa Food din celălalt fișier!
    food = relationship("Food")