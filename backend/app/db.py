from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
#from dotenv import load_dotenv
import os

#load_dotenv()

#DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/nutritrack")
# DATABASE_URL = os.environ["DATABASE_URL"]
# În loc de ./test.db, forțăm folosirea folderului /tmp care există mereu
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/test.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_push_subscription_column():
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = [col["name"] for col in inspector.get_columns("users")]
    if "push_subscription" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN push_subscription TEXT"))


def init_db():
    Base.metadata.create_all(bind=engine)
    ensure_push_subscription_column()
    # Creează toate tabelele definite în SQLAlchemy models
