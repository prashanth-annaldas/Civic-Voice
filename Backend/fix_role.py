import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://civicvoicedb_user:H0srZpXUzyVIShCK6Bbvv6D7V56oET4M@dpg-d6bgpm56ubrc73cjoccg-a.oregon-postgres.render.com/civicvoicedb"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to Live DB.")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'USER';"))
            print("Added role to users.")
        except Exception as e:
            print("Users role error:", e)
        conn.commit()
        print("Done!")
except Exception as e:
    print("Error:", e)
