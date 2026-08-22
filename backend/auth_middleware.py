import requests
from flask import request, jsonify, current_app
from functools import wraps

def get_verified_supabase_user(jwt_token):
    """
    Strictly verifies identity with Supabase Auth API endpoint.
    Returns payload containing 'id' and 'email' directly verified by Supabase server.
    """
    supabase_url = current_app.config.get("SUPABASE_URL")
    publishable_key = current_app.config.get("SUPABASE_PUBLISHABLE_KEY")
    secret_key = current_app.config.get("SUPABASE_SECRET_KEY")

    if not supabase_url:
        return None, "Supabase URL not configured on server"

    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "apikey": publishable_key or secret_key
    }

    try:
        response = requests.get(f"{supabase_url}/auth/v1/user", headers=headers, timeout=10)
        if response.status_code == 200:
            user_data = response.json()
            return user_data, None
        else:
            return None, f"Supabase auth validation failed with status {response.status_code}: {response.text}"
    except Exception as e:
        return None, f"Network exception during Supabase auth verification: {str(e)}"

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed Authorization Bearer header"}), 401
        
        token = auth_header.split(" ")[1]
        user_data, error = get_verified_supabase_user(token)
        
        if error or not user_data:
            return jsonify({"error": error or "Invalid or expired session token"}), 401

        request.supabase_user = user_data
        return f(*args, **kwargs)
    return decorated_function
