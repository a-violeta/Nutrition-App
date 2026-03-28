CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fat REAL,
    fiber REAL,
    sodium REAL
);
