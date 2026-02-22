import os
from sqlalchemy import create_engine, text

# Get LIVE DB URL
DATABASE_URL = "postgresql://civicvoicedb_user:H0srZpXUzyVIShCK6Bbvv6D7V56oET4M@dpg-d6bgpm56ubrc73cjoccg-a.oregon-postgres.render.com/civicvoicedb"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to Live DB.")
        
        # Alter USERS table
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;"))
            print("Added points to users.")
        except Exception as e:
            print("Users points error:", e)
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN trust_score FLOAT DEFAULT 100.0;"))
            print("Added trust_score to users.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN badges VARCHAR DEFAULT '';"))
            print("Added badges to users.")
        except Exception as e:
            pass

        # Alter ISSUES table
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN severity_score INTEGER;"))
            print("Added severity_score to issues.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN user_id INTEGER;"))
            print("Added user_id to issues.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN cluster_id INTEGER;"))
            print("Added cluster_id to issues.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN confirmations INTEGER DEFAULT 0;"))
            print("Added confirmations to issues.")
        except Exception as e:
            pass
        
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN created_at TIMESTAMP;"))
            print("Added created_at to issues.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN department VARCHAR;"))
            print("Added department to issues.")
        except Exception as e:
            pass
            
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE;"))
            print("Added is_duplicate to issues.")
        except Exception as e:
             pass
             
        try:
            conn.execute(text("ALTER TABLE issues ADD COLUMN escalated BOOLEAN DEFAULT FALSE;"))
            print("Added escalated to issues.")
        except Exception as e:
            pass
            
        conn.commit()
        print("Migration complete!")
except Exception as e:
    print("Database Connection Error:", e)
