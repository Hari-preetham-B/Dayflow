import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, User, SalaryStructure, SalaryAuditLog
from auth_middleware import require_auth

salary_bp = Blueprint('salary_bp', __name__)


# ============================================================
# EMPLOYEE ENDPOINTS (Read-Only)
# ============================================================

@salary_bp.route('/api/salary/my', methods=['GET'])
@require_auth
def get_my_salary():
    """
    Employee fetches their own salary structure.
    Strictly read-only and uses authenticated user ID.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    salary = SalaryStructure.query.filter_by(user_id=req_supabase_id).first()
    
    return jsonify({
        "salary_structure": salary.to_dict() if salary else None,
        "read_only": True
    }), 200


# ============================================================
# ADMIN ENDPOINTS (CRUD & Audit Log)
# ============================================================

@salary_bp.route('/api/salary/admin', methods=['GET'])
@require_auth
def admin_get_salaries():
    """
    Admin fetches all salary structures across employees or filtered by user_id.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    user_filter = request.args.get('user_id')
    query = SalaryStructure.query

    if user_filter:
        query = query.filter_by(user_id=user_filter)

    salaries = query.all()

    return jsonify({
        "salary_structures": [s.to_dict() for s in salaries]
    }), 200


@salary_bp.route('/api/salary/admin/<target_user_id>', methods=['GET'])
@require_auth
def admin_get_employee_salary(target_user_id):
    """
    Admin fetches a specific employee's salary structure and their audit log history.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    target_user = User.query.get(target_user_id)
    if not target_user:
        return jsonify({"error": "Target user not found"}), 404

    salary = SalaryStructure.query.filter_by(user_id=target_user_id).first()
    audits = SalaryAuditLog.query.filter_by(user_id=target_user_id).order_by(SalaryAuditLog.changed_at.desc()).all()

    return jsonify({
        "salary_structure": salary.to_dict() if salary else None,
        "audit_logs": [a.to_dict() for a in audits]
    }), 200


@salary_bp.route('/api/salary/admin/<target_user_id>', methods=['POST', 'PUT'])
@require_auth
def admin_upsert_salary(target_user_id):
    """
    Admin creates or updates an employee's salary structure.
    Backend explicitly calculates net_pay = basic_pay + allowances - deductions.
    Writes CREATE or UPDATE record to SalaryAuditLog.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    target_user = User.query.get(target_user_id)
    if not target_user:
        return jsonify({"error": "Target employee not found"}), 404

    body = request.get_json(silent=True) or {}

    try:
        basic_pay = float(body.get('basic_pay', 0.0))
        allowances = float(body.get('allowances', 0.0))
        deductions = float(body.get('deductions', 0.0))
    except (ValueError, TypeError):
        return jsonify({"error": "basic_pay, allowances, and deductions must be valid numbers"}), 400

    effective_date = body.get('effective_date', datetime.utcnow().strftime('%Y-%m-%d'))

    if basic_pay < 0 or allowances < 0 or deductions < 0:
        return jsonify({"error": "Salary amounts cannot be negative"}), 400

    # Backend calculation enforcement
    net_pay = basic_pay + allowances - deductions

    existing = SalaryStructure.query.filter_by(user_id=target_user_id).first()

    if existing:
        # UPDATE action
        old_val_dict = existing.to_dict()
        
        existing.basic_pay = basic_pay
        existing.allowances = allowances
        existing.deductions = deductions
        existing.net_pay = net_pay
        existing.effective_date = effective_date
        existing.updated_at = datetime.utcnow()

        db.session.flush() # ensure ID and timestamps updated
        new_val_dict = existing.to_dict()

        audit = SalaryAuditLog(
            salary_structure_id=existing.id,
            user_id=target_user_id,
            changed_by=req_supabase_id,
            action='UPDATE',
            old_values=json.dumps(old_val_dict),
            new_values=json.dumps(new_val_dict)
        )
        db.session.add(audit)
        db.session.commit()

        return jsonify({
            "message": f"Salary structure updated for {target_user.full_name or target_user.email}",
            "salary_structure": existing.to_dict(),
            "audit_log": audit.to_dict()
        }), 200
    else:
        # CREATE action
        new_salary = SalaryStructure(
            user_id=target_user_id,
            basic_pay=basic_pay,
            allowances=allowances,
            deductions=deductions,
            effective_date=effective_date
        )
        db.session.add(new_salary)
        db.session.flush() # assign ID

        new_val_dict = new_salary.to_dict()

        audit = SalaryAuditLog(
            salary_structure_id=new_salary.id,
            user_id=target_user_id,
            changed_by=req_supabase_id,
            action='CREATE',
            old_values=None,
            new_values=json.dumps(new_val_dict)
        )
        db.session.add(audit)
        db.session.commit()

        return jsonify({
            "message": f"Salary structure created for {target_user.full_name or target_user.email}",
            "salary_structure": new_salary.to_dict(),
            "audit_log": audit.to_dict()
        }), 201


@salary_bp.route('/api/salary/admin/<target_user_id>', methods=['DELETE'])
@require_auth
def admin_delete_salary(target_user_id):
    """
    Admin deletes an employee's salary structure.
    Writes DELETE record to SalaryAuditLog.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    salary = SalaryStructure.query.filter_by(user_id=target_user_id).first()
    if not salary:
        return jsonify({"error": "Salary structure not found"}), 404

    old_val_dict = salary.to_dict()

    audit = SalaryAuditLog(
        salary_structure_id=salary.id,
        user_id=target_user_id,
        changed_by=req_supabase_id,
        action='DELETE',
        old_values=json.dumps(old_val_dict),
        new_values=None
    )
    db.session.add(audit)
    db.session.delete(salary)
    db.session.commit()

    return jsonify({
        "message": "Salary structure deleted successfully",
        "audit_log": audit.to_dict()
    }), 200


@salary_bp.route('/api/salary/admin/audit', methods=['GET'])
@require_auth
def admin_get_audit_logs():
    """
    Admin views audit logs across all employees or for a specific user.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    user_filter = request.args.get('user_id')
    query = SalaryAuditLog.query

    if user_filter:
        query = query.filter_by(user_id=user_filter)

    logs = query.order_by(SalaryAuditLog.changed_at.desc()).all()

    return jsonify({
        "audit_logs": [l.to_dict() for l in logs]
    }), 200
