from flask import Blueprint, request, jsonify
from models import db, User
from auth_middleware import require_auth

admin_bp = Blueprint('admin_bp', __name__)

def require_admin_role(f):
    """
    Decorator enforcing that the requesting user has 'admin' role in database.
    """
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        supabase_id = request.supabase_user.get("id")
        current_user = User.query.get(supabase_id)
        if not current_user or current_user.role != 'admin':
            return jsonify({"error": "Admin/HR Officer access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/api/admin/users', methods=['GET'])
@require_auth
@require_admin_role
def get_all_users():
    """
    Fetch list of all users in the system for Admin management.
    """
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        "users": [user.to_dict() for user in users],
        "total": len(users)
    }), 200

@admin_bp.route('/api/admin/users/<user_id>/promote', methods=['POST'])
@require_auth
@require_admin_role
def promote_user(user_id):
    """
    Promote an employee user to Admin/HR Officer role.
    """
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    target_user.role = 'admin'
    db.session.commit()

    return jsonify({
        "message": f"Successfully promoted {target_user.email} to Admin/HR Officer",
        "user": target_user.to_dict()
    }), 200
