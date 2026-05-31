-- 1. Tabelul de Foods
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fat REAL,
    fiber REAL,
    sodium REAL,
    meal_tags TEXT[] -- ex: '{"breakfast", "snack"}'
);

-- 2. Tabelul de Ingrediente (Acum perfect aliniat cu Foods)
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    calories_per_100g REAL NOT NULL,
    protein_per_100g REAL NOT NULL,
    carbs_per_100g REAL NOT NULL,
    fat_per_100g REAL NOT NULL,
    fiber_per_100g REAL NOT NULL,
    sodium_per_100g REAL NOT NULL
);

-- 3. Tabelul de Legătură (Rețeta)
CREATE TABLE food_ingredients (
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    amount_g REAL NOT NULL,
    PRIMARY KEY (food_id, ingredient_id)
);

-- 4. Tabelul Jurnalului (Consumul)
CREATE TABLE food_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_meal TEXT NOT NULL, 
    serving_amount REAL NOT NULL 
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    programme VARCHAR(255),
    weight REAL,
    height REAL,
    age INTEGER,
    sex VARCHAR(50),
    activity_level VARCHAR(100)
);

CREATE TABLE water_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    consumed_at TIMESTAMPTZ DEFAULT NOW()
);