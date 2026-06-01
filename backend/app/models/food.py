from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy import JSON
from sqlalchemy.orm import relationship

# Importul bazei tale de date
from app.db import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    calories_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, nullable=False)
    carbs_per_100g = Column(Float, nullable=False)
    fat_per_100g = Column(Float, nullable=False)
    fiber_per_100g = Column(Float, nullable=False)
    sodium_per_100g = Column(Float, nullable=False)

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    fiber = Column(Float)
    sodium = Column(Float)
    
    # ARRAY specific pentru PostgreSQL ('breakfast', 'lunch', etc.)
    meal_tags = Column(JSON)

    # Relația către tabelul de legătură
    ingredients = relationship("FoodIngredient", back_populates="food", cascade="all, delete-orphan")

class FoodIngredient(Base):
    __tablename__ = "food_ingredients"

    food_id = Column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), primary_key=True)
    amount_g = Column(Float, nullable=False)

    food = relationship("Food", back_populates="ingredients")
    ingredient = relationship("Ingredient")