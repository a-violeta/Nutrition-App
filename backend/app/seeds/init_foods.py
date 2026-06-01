from sqlalchemy.orm import Session
from app.models.food import Food, Ingredient, FoodIngredient

# Importăm ambele liste din fișierul tău de seeds
from app.seeds.foods import FOOD_SEED, INGREDIENT_SEED

def seed_foods(db: Session):
    # Dacă avem deja mâncare sau ingrediente în baza de date, ne oprim
    if db.query(Food).count() > 0 or db.query(Ingredient).count() > 0:
        return

    # 1. Adăugăm Ingredientele
    for ing_data in INGREDIENT_SEED:
        db.add(Ingredient(**ing_data))
    
    db.commit()  # Salvăm ingredientele ca să capete ID-uri reale

    # 2. Adăugăm Mâncarea și facem matematica pe baza rețetei
    for food_data in FOOD_SEED:
        # Inițializăm mâncarea cu valori pe 0
        new_food = Food(
            name=food_data["name"],
            meal_tags=food_data["meal_tags"],
            calories=0,
            protein=0.0,
            carbs=0.0,
            fat=0.0,
            fiber=0.0,
            sodium=0.0
        )
        db.add(new_food)
        db.flush()  # Generează un ID pentru new_food înainte de commit

        # 3. Calculăm valorile și creăm legăturile (FoodIngredients)
        for item in food_data["recipe"]:
            ingredient = db.query(Ingredient).filter(Ingredient.name == item["ingredient_name"]).first()
            
            if ingredient:
                amount = item["amount_g"]
                
                # Calculul folosind regula de trei simplă
                new_food.calories += int((amount / 100) * ingredient.calories_per_100g)
                new_food.protein += round((amount / 100) * ingredient.protein_per_100g, 2)
                new_food.carbs += round((amount / 100) * ingredient.carbs_per_100g, 2)
                new_food.fat += round((amount / 100) * ingredient.fat_per_100g, 2)
                new_food.fiber += round((amount / 100) * ingredient.fiber_per_100g, 2)
                new_food.sodium += round((amount / 100) * ingredient.sodium_per_100g, 2)

                # Creăm legătura în tabelul asociativ
                food_ing = FoodIngredient(
                    food_id=new_food.id,
                    ingredient_id=ingredient.id,
                    amount_g=amount
                )
                db.add(food_ing)

    # Salvăm totul la final
    db.commit()