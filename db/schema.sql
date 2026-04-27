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

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
