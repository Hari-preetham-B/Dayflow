from flask import Blueprint, request, jsonify
from models import db, User
from auth_middleware import require_auth, get_verified_supabase_user

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/api/auth/sync', methods=['POST'])
def sync_user():
    """
    Sync authenticated Supabase user into Flask database.
    IDENTITY IS DERIVED STRICTLY FROM THE VERIFIED SUPABASE JWT TOKEN.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Bearer token in Authorization header"}), 401
    
    token = auth_header.split(" ")[1]
    verified_supabase_user, error = get_verified_supabase_user(token)
    
    if error or not verified_supabase_user:
        return jsonify({"error": error or "Unauthorized token verification"}), 401

    # Extract verified ID & email strictly from Supabase payload
    supabase_id = verified_supabase_user.get("id")
    verified_email = verified_supabase_user.get("email")

    if not supabase_id or not verified_email:
        return jsonify({"error": "Verified token payload missing ID or email"}), 400

    # Body can optionally contain custom employee_id entered during signup
    body = request.get_json(silent=True) or {}
    employee_id_input = body.get("employee_id") or f"EMP-{supabase_id[:6].upper()}"

    # Check if user exists in Flask database
    existing_user = User.query.get(supabase_id)

    # Atomically check if any Admin user exists in the database
    try:
        existing_admin = User.query.filter_by(role='admin').with_for_update().first()
    except Exception:
        existing_admin = User.query.filter_by(role='admin').first()

    if existing_user:
        # Update employee_id if provided and changed
        if body.get("employee_id") and existing_user.employee_id != body.get("employee_id"):
            existing_user.employee_id = body.get("employee_id")
        
        # Self-Correction: If no admin exists in the database yet, upgrade this first valid user to Admin!
        if existing_admin is None and existing_user.role != 'admin':
            existing_user.role = 'admin'
            existing_user.department = "HR & Operations"
            existing_user.title = "HR Manager"

        db.session.commit()
        return jsonify({"user": existing_user.to_dict(), "is_new": False}), 200

    # If new user: assign 'admin' if no admin currently exists in the system, otherwise 'employee'
    assigned_role = 'admin' if existing_admin is None else 'employee'

    # Handle collision for employee_id if any
    duplicate_emp = User.query.filter_by(employee_id=employee_id_input).first()
    if duplicate_emp:
        employee_id_input = f"EMP-{supabase_id[:6].upper()}"

    new_user = User(
        id=supabase_id,
        email=verified_email,
        employee_id=employee_id_input,
        role=assigned_role,
        department="HR & Operations" if assigned_role == 'admin' else "Engineering",
        title="HR Manager" if assigned_role == 'admin' else "Team Member"
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"user": new_user.to_dict(), "is_new": True}), 201


@auth_bp.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """
    Get current logged in user profile based on verified Supabase token.
    """
    supabase_id = request.supabase_user.get("id")
    user = User.query.get(supabase_id)
    
    if not user:
        return jsonify({"error": "User profile not found in database. Please sync first."}), 4400

    return jsonify({"user": user.to_dict()}), 200
