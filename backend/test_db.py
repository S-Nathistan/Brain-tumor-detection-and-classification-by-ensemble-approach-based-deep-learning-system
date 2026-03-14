from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:4545@localhost:5432/brain_tumor"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("✅ Connected successfully!")
        print("PostgreSQL version:", result.fetchone()[0])
except Exception as e:
    print("❌ Connection failed:")
    print(e)
