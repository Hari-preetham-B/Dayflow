from flask import Blueprint, request, jsonify
from models import db, User, EmployeeDocument
from auth_middleware import require_auth

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/api/profile', methods=['GET'])
@profile_bp.route('/api/profile/<user_id>', methods=['GET'])
@require_auth
def get_profile(user_id=None):
    """
    Fetch employee profile details, job details, reporting manager info, salary structure, and attached documents.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)

    if not req_user:
        return jsonify({"error": "Requesting user profile not synced"}), 404

    target_id = user_id or req_supabase_id

    # Non-admins can only view their own profile
    if req_user.role != 'admin' and target_id != req_supabase_id:
        return jsonify({"error": "Forbidden: You can only view your own profile"}), 403

    target_user = User.query.get(target_id)
    if not target_user:
        return jsonify({"error": f"Employee profile not found for ID: {target_id}"}), 404

    return jsonify({"user": target_user.to_dict(include_documents=True)}), 200


@profile_bp.route('/api/profile/<user_id>', methods=['PUT'])
@require_auth
def update_profile(user_id):
    """
    Update employee profile with explicit server-side role whitelisting.
    Employees: Allowed ONLY ['full_name', 'phone', 'address', 'emergency_contact', 'avatar_url'].
    Admins: Full CRUD access across all fields.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)

    if not req_user:
        return jsonify({"error": "Requesting user profile not synced"}), 404

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "Target user profile not found"}), 404

    # Non-admins can only update their own profile
    is_admin = (req_user.role == 'admin')
    if not is_admin and user_id != req_supabase_id:
        return jsonify({"error": "Forbidden: You can only edit your own profile"}), 403

    body = request.get_json(silent=True) or {}

    # Define explicit Whitelisted Fields per role
    EMPLOYEE_ALLOWED_FIELDS = {'full_name', 'phone', 'address', 'emergency_contact', 'avatar_url'}
    ADMIN_ALLOWED_FIELDS = {
        'full_name', 'phone', 'address', 'emergency_contact', 'avatar_url',
        'title', 'department', 'date_of_joining', 'employment_type',
        'reporting_manager_id', 'basic_salary', 'hra', 'allowances', 'role'
    }

    allowed_fields = ADMIN_ALLOWED_FIELDS if is_admin else EMPLOYEE_ALLOWED_FIELDS

    # Apply only whitelisted fields
    if 'full_name' in body and 'full_name' in allowed_fields:
        target_user.full_name = body['full_name']
    if 'phone' in body and 'phone' in allowed_fields:
        target_user.phone = body['phone']
    if 'address' in body and 'address' in allowed_fields:
        target_user.address = body['address']
    if 'emergency_contact' in body and 'emergency_contact' in allowed_fields:
        target_user.emergency_contact = body['emergency_contact']
    if 'avatar_url' in body and 'avatar_url' in allowed_fields:
        target_user.avatar_url = body['avatar_url']

    # Admin-only fields
    if is_admin:
        if 'title' in body:
            target_user.title = body['title']
        if 'department' in body:
            target_user.department = body['department']
        if 'date_of_joining' in body:
            target_user.date_of_joining = body['date_of_joining']
        if 'employment_type' in body:
            target_user.employment_type = body['employment_type']
        if 'reporting_manager_id' in body:
            # Validate manager exists or is None
            mgr_id = body['reporting_manager_id']
            if mgr_id and mgr_id != "":
                mgr = User.query.get(mgr_id)
                target_user.reporting_manager_id = mgr.id if mgr else None
            else:
                target_user.reporting_manager_id = None
        if 'basic_salary' in body:
            target_user.basic_salary = body['basic_salary']
        if 'hra' in body:
            target_user.hra = body['hra']
        if 'allowances' in body:
            target_user.allowances = body['allowances']
        if 'role' in body and body['role'] in ['admin', 'employee']:
            target_user.role = body['role']

    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": target_user.to_dict(include_documents=True)}), 200


@profile_bp.route('/api/employees/managers', methods=['GET'])
@require_auth
def get_reporting_managers():
    """
    Get dropdown list of existing users to populate Reporting Manager assignment selector.
    """
    users = User.query.all()
    managers_list = [{
        'id': u.id,
        'full_name': u.full_name or u.email,
        'email': u.email,
        'employee_id': u.employee_id,
        'title': u.title,
        'department': u.department
    } for u in users]

    return jsonify({"managers": managers_list}), 200


@profile_bp.route('/api/profile/<user_id>/documents', methods=['POST'])
@require_auth
def add_document(user_id):
    """
    Attach document metadata record to employee profile.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)

    if not req_user:
        return jsonify({"error": "Requesting user profile not synced"}), 404

    is_admin = (req_user.role == 'admin')
    if not is_admin and user_id != req_supabase_id:
        return jsonify({"error": "Forbidden: You can only upload documents to your own profile"}), 403

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "Target user not found"}), 404

    body = request.get_json(silent=True) or {}
    document_name = body.get("document_name")
    file_url = body.get("file_url")

    if not document_name or not file_url:
        return jsonify({"error": "document_name and file_url are required"}), 400

    new_doc = EmployeeDocument(
        user_id=target_user.id,
        document_name=document_name,
        document_type=body.get("document_type", "General"),
        file_url=file_url,
        file_size=body.get("file_size", "1.2 MB")
    )

    db.session.add(new_doc)
    db.session.commit()

    return jsonify({"message": "Document uploaded successfully", "document": new_doc.to_dict()}), 201


@profile_bp.route('/api/profile/<user_id>/documents/<int:doc_id>', methods=['DELETE'])
@require_auth
def delete_document(user_id, doc_id):
    """
    Delete attached document metadata record.
    Security: Employees can delete ONLY documents tied to their own user_id.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)

    if not req_user:
        return jsonify({"error": "Requesting user profile not synced"}), 404

    doc = EmployeeDocument.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    is_admin = (req_user.role == 'admin')
    
    # Permission Check: Employee can delete ONLY their own document
    if not is_admin and doc.user_id != req_supabase_id:
        return jsonify({"error": "Forbidden: You cannot delete another employee's document"}), 403

    db.session.delete(doc)
    db.session.commit()

    return jsonify({"message": "Document deleted successfully"}), 200
