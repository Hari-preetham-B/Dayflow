import os
from urllib.parse import unquote, quote_plus
from dotenv import load_dotenv

# Load environment variables from backend/.env explicitly
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

def fix_database_url(url):
    """
    Safely sanitizes and URL-encodes PostgreSQL connection URLs.
    Handles unquoted special characters like '@' in database passwords.
    """
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    try:
        if '://' in url:
            scheme, rest = url.split('://', 1)
            last_at = rest.rfind('@')
            if last_at != -1:
                userinfo = rest[:last_at]
                host_path = rest[last_at + 1:]
                if ':' in userinfo:
                    user, password = userinfo.split(':', 1)
                    raw_password = unquote(password)
                    encoded_password = quote_plus(raw_password)
                    return f"{scheme}://{user}:{encoded_password}@{host_path}"
    except Exception:
        pass
    return url

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dayflow-default-secret-key")
    SQLALCHEMY_DATABASE_URI = fix_database_url(os.getenv("DATABASE_URL"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
