import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("TEST_DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "Missing TEST_DATABASE_URL environment variable. "
        "Set TEST_DATABASE_URL to your test database connection string."
    )

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("✅ Connected successfully!")
        print("PostgreSQL version:", result.fetchone()[0])
except Exception as e:
    print("❌ Connection failed:")
    print(e)
