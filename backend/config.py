import os
from dotenv import load_dotenv

# Load environment variables from backend/.env explicitly
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dayflow-default-secret-key")
    db_url = os.getenv("DATABASE_URL")
    # Use Postgres if provided, otherwise SQLite
    SQLALCHEMY_DATABASE_URI = db_url if db_url else f"sqlite:///{os.path.join(basedir, 'dayflow.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
