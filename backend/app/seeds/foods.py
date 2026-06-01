# ==========================================
# 1. INGREDIENTS (Values per 100g)
# ==========================================
INGREDIENT_SEED = [
    # Proteins & Meat
    {"name": "Chicken Breast", "calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6, "fiber_per_100g": 0, "sodium_per_100g": 74},
    {"name": "Salmon", "calories_per_100g": 208, "protein_per_100g": 20, "carbs_per_100g": 0, "fat_per_100g": 13, "fiber_per_100g": 0, "sodium_per_100g": 59},
    {"name": "Beef Steak", "calories_per_100g": 250, "protein_per_100g": 26, "carbs_per_100g": 0, "fat_per_100g": 15, "fiber_per_100g": 0, "sodium_per_100g": 60},
    {"name": "Turkey Breast", "calories_per_100g": 135, "protein_per_100g": 30, "carbs_per_100g": 0, "fat_per_100g": 1, "fiber_per_100g": 0, "sodium_per_100g": 52},
    {"name": "Bacon", "calories_per_100g": 541, "protein_per_100g": 37, "carbs_per_100g": 1.4, "fat_per_100g": 42, "fiber_per_100g": 0, "sodium_per_100g": 1717},
    {"name": "Tuna", "calories_per_100g": 132, "protein_per_100g": 28, "carbs_per_100g": 0, "fat_per_100g": 1, "fiber_per_100g": 0, "sodium_per_100g": 37},
    {"name": "Tofu", "calories_per_100g": 144, "protein_per_100g": 16, "carbs_per_100g": 3, "fat_per_100g": 9, "fiber_per_100g": 2, "sodium_per_100g": 14},
    
    # Dairy & Eggs
    {"name": "Egg", "calories_per_100g": 155, "protein_per_100g": 12.6, "carbs_per_100g": 1.1, "fat_per_100g": 10.6, "fiber_per_100g": 0, "sodium_per_100g": 124},
    {"name": "Greek Yogurt", "calories_per_100g": 59, "protein_per_100g": 10, "carbs_per_100g": 3.5, "fat_per_100g": 0.4, "fiber_per_100g": 0, "sodium_per_100g": 36},
    {"name": "Cheddar Cheese", "calories_per_100g": 402, "protein_per_100g": 25, "carbs_per_100g": 1.3, "fat_per_100g": 33, "fiber_per_100g": 0, "sodium_per_100g": 621},
    {"name": "Milk", "calories_per_100g": 44, "protein_per_100g": 3.4, "carbs_per_100g": 4.8, "fat_per_100g": 1.5, "fiber_per_100g": 0, "sodium_per_100g": 40},
    {"name": "Butter", "calories_per_100g": 717, "protein_per_100g": 0.9, "carbs_per_100g": 0.1, "fat_per_100g": 81, "fiber_per_100g": 0, "sodium_per_100g": 11},
    
    # Carbs & Grains
    {"name": "Brown Rice", "calories_per_100g": 110, "protein_per_100g": 2.6, "carbs_per_100g": 23, "fat_per_100g": 0.9, "fiber_per_100g": 1.8, "sodium_per_100g": 5},
    {"name": "White Rice", "calories_per_100g": 130, "protein_per_100g": 2.7, "carbs_per_100g": 28, "fat_per_100g": 0.3, "fiber_per_100g": 0.4, "sodium_per_100g": 1},
    {"name": "Quinoa", "calories_per_100g": 120, "protein_per_100g": 4.4, "carbs_per_100g": 21, "fat_per_100g": 1.9, "fiber_per_100g": 2.8, "sodium_per_100g": 7},
    {"name": "Pasta", "calories_per_100g": 158, "protein_per_100g": 5.8, "carbs_per_100g": 31, "fat_per_100g": 0.9, "fiber_per_100g": 1.8, "sodium_per_100g": 1},
    {"name": "Whole Wheat Bread", "calories_per_100g": 252, "protein_per_100g": 12.4, "carbs_per_100g": 42.7, "fat_per_100g": 3.5, "fiber_per_100g": 6, "sodium_per_100g": 460},
    {"name": "Oatmeal", "calories_per_100g": 66, "protein_per_100g": 2.1, "carbs_per_100g": 11.5, "fat_per_100g": 1.1, "fiber_per_100g": 1.7, "sodium_per_100g": 1},
    {"name": "Sweet Potato", "calories_per_100g": 86, "protein_per_100g": 1.6, "carbs_per_100g": 20, "fat_per_100g": 0.1, "fiber_per_100g": 3, "sodium_per_100g": 55},
    {"name": "Potato", "calories_per_100g": 77, "protein_per_100g": 2, "carbs_per_100g": 17, "fat_per_100g": 0.1, "fiber_per_100g": 2.2, "sodium_per_100g": 6},
    
    # Veggies
    {"name": "Spinach", "calories_per_100g": 23, "protein_per_100g": 2.9, "carbs_per_100g": 3.6, "fat_per_100g": 0.4, "fiber_per_100g": 2.2, "sodium_per_100g": 79},
    {"name": "Broccoli", "calories_per_100g": 35, "protein_per_100g": 2.4, "carbs_per_100g": 7, "fat_per_100g": 0.4, "fiber_per_100g": 3.3, "sodium_per_100g": 41},
    {"name": "Tomato", "calories_per_100g": 18, "protein_per_100g": 0.9, "carbs_per_100g": 3.9, "fat_per_100g": 0.2, "fiber_per_100g": 1.2, "sodium_per_100g": 5},
    {"name": "Lettuce", "calories_per_100g": 15, "protein_per_100g": 1.4, "carbs_per_100g": 2.9, "fat_per_100g": 0.2, "fiber_per_100g": 1.3, "sodium_per_100g": 28},
    {"name": "Bell Pepper", "calories_per_100g": 20, "protein_per_100g": 0.9, "carbs_per_100g": 4.6, "fat_per_100g": 0.2, "fiber_per_100g": 1.7, "sodium_per_100g": 3},
    {"name": "Onion", "calories_per_100g": 40, "protein_per_100g": 1.1, "carbs_per_100g": 9.3, "fat_per_100g": 0.1, "fiber_per_100g": 1.7, "sodium_per_100g": 4},
    
    # Fruits, Nuts & Oils
    {"name": "Avocado", "calories_per_100g": 160, "protein_per_100g": 2, "carbs_per_100g": 8.5, "fat_per_100g": 14.7, "fiber_per_100g": 6.7, "sodium_per_100g": 7},
    {"name": "Banana", "calories_per_100g": 89, "protein_per_100g": 1.1, "carbs_per_100g": 22.8, "fat_per_100g": 0.3, "fiber_per_100g": 2.6, "sodium_per_100g": 1},
    {"name": "Apple", "calories_per_100g": 52, "protein_per_100g": 0.3, "carbs_per_100g": 13.8, "fat_per_100g": 0.2, "fiber_per_100g": 2.4, "sodium_per_100g": 1},
    {"name": "Blueberries", "calories_per_100g": 57, "protein_per_100g": 0.7, "carbs_per_100g": 14, "fat_per_100g": 0.3, "fiber_per_100g": 2.4, "sodium_per_100g": 1},
    {"name": "Almonds", "calories_per_100g": 579, "protein_per_100g": 21.1, "carbs_per_100g": 21.6, "fat_per_100g": 49.9, "fiber_per_100g": 12.5, "sodium_per_100g": 1},
    {"name": "Peanut Butter", "calories_per_100g": 588, "protein_per_100g": 25, "carbs_per_100g": 20, "fat_per_100g": 50, "fiber_per_100g": 6, "sodium_per_100g": 425},
    {"name": "Olive Oil", "calories_per_100g": 884, "protein_per_100g": 0, "carbs_per_100g": 0, "fat_per_100g": 100, "fiber_per_100g": 0, "sodium_per_100g": 2},
    {"name": "Honey", "calories_per_100g": 304, "protein_per_100g": 0.3, "carbs_per_100g": 82, "fat_per_100g": 0, "fiber_per_100g": 0.2, "sodium_per_100g": 4}
]

# ==========================================
# 2. FOODS / DISHES
# ==========================================
FOOD_SEED = [
    # ------------------ BREAKFAST (12) ------------------
    {
        "name": "Oatmeal with Peanut Butter & Banana",
        "meal_tags": ["breakfast", "snack"],
        "recipe": [
            {"ingredient_name": "Oatmeal", "amount_g": 230},
            {"ingredient_name": "Banana", "amount_g": 100},
            {"ingredient_name": "Peanut Butter", "amount_g": 30}
        ]
    },
    {
        "name": "Classic Bacon and Eggs",
        "meal_tags": ["breakfast"],
        "recipe": [
            {"ingredient_name": "Egg", "amount_g": 100},  # 2 eggs
            {"ingredient_name": "Bacon", "amount_g": 30},
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60} # 2 slices
        ]
    },
    {
        "name": "Avocado Toast with Fried Egg",
        "meal_tags": ["breakfast", "snack"],
        "recipe": [
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60},
            {"ingredient_name": "Avocado", "amount_g": 50},
            {"ingredient_name": "Egg", "amount_g": 50},
            {"ingredient_name": "Olive Oil", "amount_g": 5}
        ]
    },
    {
        "name": "Greek Yogurt Parfait with Berries",
        "meal_tags": ["breakfast", "snack"],
        "recipe": [
            {"ingredient_name": "Greek Yogurt", "amount_g": 200},
            {"ingredient_name": "Blueberries", "amount_g": 80},
            {"ingredient_name": "Honey", "amount_g": 15}
        ]
    },
    {
        "name": "Scrambled Eggs with Spinach & Cheese",
        "meal_tags": ["breakfast"],
        "recipe": [
            {"ingredient_name": "Egg", "amount_g": 150}, # 3 eggs
            {"ingredient_name": "Spinach", "amount_g": 50},
            {"ingredient_name": "Cheddar Cheese", "amount_g": 30},
            {"ingredient_name": "Butter", "amount_g": 10}
        ]
    },
    {
        "name": "Protein Banana Smoothie",
        "meal_tags": ["breakfast", "snack"],
        "recipe": [
            {"ingredient_name": "Milk", "amount_g": 250},
            {"ingredient_name": "Banana", "amount_g": 120},
            {"ingredient_name": "Peanut Butter", "amount_g": 20}
        ]
    },
    {
        "name": "Tofu Scramble with Bell Peppers",
        "meal_tags": ["breakfast", "lunch"],
        "recipe": [
            {"ingredient_name": "Tofu", "amount_g": 150},
            {"ingredient_name": "Bell Pepper", "amount_g": 50},
            {"ingredient_name": "Onion", "amount_g": 30},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Apple Cinnamon Oatmeal",
        "meal_tags": ["breakfast"],
        "recipe": [
            {"ingredient_name": "Oatmeal", "amount_g": 200},
            {"ingredient_name": "Apple", "amount_g": 100},
            {"ingredient_name": "Honey", "amount_g": 10}
        ]
    },
    {
        "name": "Turkey & Cheese Omelet",
        "meal_tags": ["breakfast", "lunch"],
        "recipe": [
            {"ingredient_name": "Egg", "amount_g": 100},
            {"ingredient_name": "Turkey Breast", "amount_g": 50},
            {"ingredient_name": "Cheddar Cheese", "amount_g": 20},
            {"ingredient_name": "Butter", "amount_g": 5}
        ]
    },
    {
        "name": "Sweet Potato Breakfast Hash",
        "meal_tags": ["breakfast", "lunch"],
        "recipe": [
            {"ingredient_name": "Sweet Potato", "amount_g": 150},
            {"ingredient_name": "Egg", "amount_g": 50},
            {"ingredient_name": "Onion", "amount_g": 30},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },

    # ------------------ LUNCH (12) ------------------
    {
        "name": "Grilled Chicken Rice Bowl",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Chicken Breast", "amount_g": 150},
            {"ingredient_name": "Brown Rice", "amount_g": 150},
            {"ingredient_name": "Broccoli", "amount_g": 100},
            {"ingredient_name": "Olive Oil", "amount_g": 5}
        ]
    },
    {
        "name": "Turkey Club Sandwich",
        "meal_tags": ["lunch"],
        "recipe": [
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60},
            {"ingredient_name": "Turkey Breast", "amount_g": 80},
            {"ingredient_name": "Bacon", "amount_g": 15},
            {"ingredient_name": "Lettuce", "amount_g": 20},
            {"ingredient_name": "Tomato", "amount_g": 30}
        ]
    },
    {
        "name": "Tuna Salad Sandwich",
        "meal_tags": ["lunch"],
        "recipe": [
            {"ingredient_name": "Tuna", "amount_g": 100},
            {"ingredient_name": "Greek Yogurt", "amount_g": 30}, # Healthy mayo substitute
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60},
            {"ingredient_name": "Lettuce", "amount_g": 20}
        ]
    },
    {
        "name": "Quinoa Bowl with Tofu & Spinach",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Quinoa", "amount_g": 150},
            {"ingredient_name": "Tofu", "amount_g": 120},
            {"ingredient_name": "Spinach", "amount_g": 80},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Chicken Caesar Salad (Healthy Version)",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Chicken Breast", "amount_g": 120},
            {"ingredient_name": "Lettuce", "amount_g": 100},
            {"ingredient_name": "Cheddar Cheese", "amount_g": 20},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Beef and Broccoli Stir-fry",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Beef Steak", "amount_g": 150},
            {"ingredient_name": "Broccoli", "amount_g": 120},
            {"ingredient_name": "White Rice", "amount_g": 150},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Greek Chicken Wrap",
        "meal_tags": ["lunch"],
        "recipe": [
            {"ingredient_name": "Chicken Breast", "amount_g": 100},
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60}, # Pita sub
            {"ingredient_name": "Tomato", "amount_g": 40},
            {"ingredient_name": "Greek Yogurt", "amount_g": 30}
        ]
    },
    {
        "name": "Egg Salad Sandwich",
        "meal_tags": ["lunch", "snack"],
        "recipe": [
            {"ingredient_name": "Egg", "amount_g": 100},
            {"ingredient_name": "Greek Yogurt", "amount_g": 30},
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 60}
        ]
    },
    {
        "name": "Veggie Loaded Baked Potato",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Potato", "amount_g": 200},
            {"ingredient_name": "Broccoli", "amount_g": 80},
            {"ingredient_name": "Cheddar Cheese", "amount_g": 30},
            {"ingredient_name": "Butter", "amount_g": 10}
        ]
    },
    {
        "name": "Pesto Pasta with Grilled Chicken",
        "meal_tags": ["lunch", "dinner"],
        "recipe": [
            {"ingredient_name": "Pasta", "amount_g": 150},
            {"ingredient_name": "Chicken Breast", "amount_g": 100},
            {"ingredient_name": "Olive Oil", "amount_g": 15},
            {"ingredient_name": "Spinach", "amount_g": 30}
        ]
    },

    # ------------------ DINNER (10) ------------------
    {
        "name": "Steak with Roasted Potatoes & Asparagus",
        "meal_tags": ["dinner"],
        "recipe": [
            {"ingredient_name": "Beef Steak", "amount_g": 200},
            {"ingredient_name": "Potato", "amount_g": 150},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Grilled Salmon with White Rice & Spinach",
        "meal_tags": ["dinner"],
        "recipe": [
            {"ingredient_name": "Salmon", "amount_g": 150},
            {"ingredient_name": "White Rice", "amount_g": 150},
            {"ingredient_name": "Spinach", "amount_g": 80},
            {"ingredient_name": "Olive Oil", "amount_g": 5}
        ]
    },
    {
        "name": "Turkey Meatballs with Pasta",
        "meal_tags": ["dinner"],
        "recipe": [
            {"ingredient_name": "Turkey Breast", "amount_g": 150},
            {"ingredient_name": "Pasta", "amount_g": 150},
            {"ingredient_name": "Tomato", "amount_g": 100},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Chicken Fajita Bowl",
        "meal_tags": ["dinner", "lunch"],
        "recipe": [
            {"ingredient_name": "Chicken Breast", "amount_g": 150},
            {"ingredient_name": "Bell Pepper", "amount_g": 80},
            {"ingredient_name": "Onion", "amount_g": 50},
            {"ingredient_name": "White Rice", "amount_g": 150},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Garlic Butter Steak Bites & Sweet Potato",
        "meal_tags": ["dinner"],
        "recipe": [
            {"ingredient_name": "Beef Steak", "amount_g": 180},
            {"ingredient_name": "Sweet Potato", "amount_g": 150},
            {"ingredient_name": "Butter", "amount_g": 15}
        ]
    },
    {
        "name": "Baked Salmon with Quinoa & Broccoli",
        "meal_tags": ["dinner", "lunch"],
        "recipe": [
            {"ingredient_name": "Salmon", "amount_g": 150},
            {"ingredient_name": "Quinoa", "amount_g": 120},
            {"ingredient_name": "Broccoli", "amount_g": 100},
            {"ingredient_name": "Olive Oil", "amount_g": 5}
        ]
    },
    {
        "name": "Chicken & Broccoli Pasta",
        "meal_tags": ["dinner"],
        "recipe": [
            {"ingredient_name": "Chicken Breast", "amount_g": 120},
            {"ingredient_name": "Pasta", "amount_g": 150},
            {"ingredient_name": "Broccoli", "amount_g": 80},
            {"ingredient_name": "Olive Oil", "amount_g": 10}
        ]
    },
    {
        "name": "Quinoa Stuffed Bell Peppers",
        "meal_tags": ["dinner", "lunch"],
        "recipe": [
            {"ingredient_name": "Bell Pepper", "amount_g": 150},
            {"ingredient_name": "Quinoa", "amount_g": 100},
            {"ingredient_name": "Turkey Breast", "amount_g": 100},
            {"ingredient_name": "Cheddar Cheese", "amount_g": 20}
        ]
    },
    
    # ------------------ SNACKS (10) ------------------
    {
        "name": "Apple Slices with Peanut Butter",
        "meal_tags": ["snack"],
        "recipe": [
            {"ingredient_name": "Apple", "amount_g": 150},
            {"ingredient_name": "Peanut Butter", "amount_g": 30}
        ]
    },
    {
        "name": "Handful of Almonds",
        "meal_tags": ["snack"],
        "recipe": [
            {"ingredient_name": "Almonds", "amount_g": 30}
        ]
    },
    {
        "name": "Greek Yogurt with Honey",
        "meal_tags": ["snack", "breakfast"],
        "recipe": [
            {"ingredient_name": "Greek Yogurt", "amount_g": 150},
            {"ingredient_name": "Honey", "amount_g": 15}
        ]
    },
    {
        "name": "Hard Boiled Eggs (2)",
        "meal_tags": ["snack", "breakfast"],
        "recipe": [
            {"ingredient_name": "Egg", "amount_g": 100}
        ]
    },
    {
        "name": "Banana",
        "meal_tags": ["snack", "breakfast"],
        "recipe": [
            {"ingredient_name": "Banana", "amount_g": 120}
        ]
    },
    {
        "name": "Cheese & Apple Slices",
        "meal_tags": ["snack"],
        "recipe": [
            {"ingredient_name": "Cheddar Cheese", "amount_g": 30},
            {"ingredient_name": "Apple", "amount_g": 100}
        ]
    },
    {
        "name": "Tuna and Crackers",
        "meal_tags": ["snack"],
        "recipe": [
            {"ingredient_name": "Tuna", "amount_g": 80},
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 30} # Cracker sub
        ]
    },
    {
        "name": "Berry Cup",
        "meal_tags": ["snack"],
        "recipe": [
            {"ingredient_name": "Blueberries", "amount_g": 150}
        ]
    },
    {
        "name": "Small Avocado Toast",
        "meal_tags": ["snack", "breakfast"],
        "recipe": [
            {"ingredient_name": "Whole Wheat Bread", "amount_g": 30},
            {"ingredient_name": "Avocado", "amount_g": 40}
        ]
    }
]