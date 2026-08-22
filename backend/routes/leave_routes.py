from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from models import db, User, Attendance, LeaveRequest
from auth_middleware import require_auth

leave_bp = Blueprint('leave_bp', __name__)


def get_weekdays_in_range(start_str, end_str):
    """Return list of YYYY-MM-DD strings for Mon-Fri dates in range (inclusive)."""
    start = datetime.strptime(start_str, '%Y-%m-%d').date()
    end = datetime.strptime(end_str, '%Y-%m-%d').date()
    days = []
    current = start
    while current <= end:
        if current.weekday() < 5:  # Mon-Fri
            days.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    return days


def create_leave_attendance_records(user_id, leave_request):
    """Create or update Attendance records to 'Leave' for each weekday in the leave range."""
    weekdays = get_weekdays_in_range(leave_request.start_date, leave_request.end_date)
    for day_str in weekdays:
        existing = Attendance.query.filter_by(user_id=user_id, date=day_str).first()
        if existing:
            existing.status = 'Leave'
            existing.notes = f'Auto-created from approved leave #{leave_request.id}'
            existing.check_in = None
            existing.check_out = None
        else:
            record = Attendance(
                user_id=user_id,
                date=day_str,
                status='Leave',
                notes=f'Auto-created from approved leave #{leave_request.id}'
            )
            db.session.add(record)


def revert_leave_attendance_records(user_id, leave_request):
    """Delete auto-created Leave attendance records so Phase 2 auto-absent logic re-derives them."""
    weekdays = get_weekdays_in_range(leave_request.start_date, leave_request.end_date)
    for day_str in weekdays:
        existing = Attendance.query.filter_by(user_id=user_id, date=day_str).first()
        if existing and existing.status == 'Leave':
            db.session.delete(existing)


def check_overlap(user_id, start_date, end_date, exclude_id=None):
    """Check if any Pending or Approved leave request overlaps with the given date range."""
    query = LeaveRequest.query.filter(
        LeaveRequest.user_id == user_id,
        LeaveRequest.status.in_(['Pending', 'Approved']),
        LeaveRequest.start_date <= end_date,
        LeaveRequest.end_date >= start_date
    )
    if exclude_id:
        query = query.filter(LeaveRequest.id != exclude_id)
    return query.first()


# ============================================================
# EMPLOYEE ENDPOINTS
# ============================================================

@leave_bp.route('/api/leave/apply', methods=['POST'])
@require_auth
def apply_leave():
    """Employee submits a new leave request. Server validates date overlap."""
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    body = request.get_json(silent=True) or {}
    leave_type = body.get('leave_type')
    start_date = body.get('start_date')
    end_date = body.get('end_date')
    remarks = body.get('remarks', '')

    if not leave_type or not start_date or not end_date:
        return jsonify({"error": "leave_type, start_date, and end_date are required"}), 400

    if leave_type not in ('Paid', 'Sick', 'Unpaid'):
        return jsonify({"error": "leave_type must be Paid, Sick, or Unpaid"}), 400

    if start_date > end_date:
        return jsonify({"error": "start_date must be on or before end_date"}), 400

    # Overlap check
    overlap = check_overlap(req_supabase_id, start_date, end_date)
    if overlap:
        return jsonify({
            "error": f"Date range overlaps with existing {overlap.status} leave request #{overlap.id} ({overlap.start_date} to {overlap.end_date})"
        }), 409

    leave_req = LeaveRequest(
        user_id=req_supabase_id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        remarks=remarks,
        status='Pending'
    )
    db.session.add(leave_req)
    db.session.commit()

    # Trigger notification to Admins
    try:
        from routes.notification_routes import notify_admins
        emp_name = req_user.full_name or req_user.email
        notify_admins(
            title=f"New Leave Request from {emp_name}",
            message=f"{emp_name} submitted a {leave_type} leave request from {start_date} to {end_date}.",
            type='leave'
        )
    except Exception as e:
        print(f"[NOTIFY ERROR] Leave apply trigger failed: {str(e)}")

    return jsonify({
        "message": "Leave request submitted successfully!",
        "leave_request": leave_req.to_dict()
    }), 201


@leave_bp.route('/api/leave/my', methods=['GET'])
@require_auth
def get_my_leaves():
    """Fetch employee's own leave request history, optionally filtered by status."""
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    status_filter = request.args.get('status')
    query = LeaveRequest.query.filter_by(user_id=req_supabase_id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    requests_list = query.order_by(LeaveRequest.created_at.desc()).all()

    # Summary counts
    all_reqs = LeaveRequest.query.filter_by(user_id=req_supabase_id).all()
    pending_cnt = sum(1 for r in all_reqs if r.status == 'Pending')
    approved_cnt = sum(1 for r in all_reqs if r.status == 'Approved')
    rejected_cnt = sum(1 for r in all_reqs if r.status == 'Rejected')

    return jsonify({
        "leave_requests": [r.to_dict() for r in requests_list],
        "summary": {
            "pending": pending_cnt,
            "approved": approved_cnt,
            "rejected": rejected_cnt,
            "total": len(all_reqs)
        }
    }), 200


@leave_bp.route('/api/leave/<int:leave_id>/cancel', methods=['DELETE'])
@require_auth
def cancel_leave(leave_id):
    """Employee cancels their own Pending leave request."""
    req_supabase_id = request.supabase_user.get("id")

    leave_req = LeaveRequest.query.get(leave_id)
    if not leave_req:
        return jsonify({"error": "Leave request not found"}), 404

    if leave_req.user_id != req_supabase_id:
        return jsonify({"error": "You can only cancel your own leave requests"}), 403

    if leave_req.status != 'Pending':
        return jsonify({"error": f"Cannot cancel a request with status '{leave_req.status}'. Only Pending requests can be cancelled."}), 400

    db.session.delete(leave_req)
    db.session.commit()

    return jsonify({"message": "Leave request cancelled successfully"}), 200


@leave_bp.route('/api/leave/pending-count', methods=['GET'])
@require_auth
def get_pending_count():
    """Quick count of pending leave requests for dashboard card."""
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    if req_user.role == 'admin':
        # Admin sees total pending across all employees
        count = LeaveRequest.query.filter_by(status='Pending').count()
    else:
        count = LeaveRequest.query.filter_by(user_id=req_supabase_id, status='Pending').count()

    return jsonify({"pending_count": count}), 200


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@leave_bp.route('/api/leave/admin', methods=['GET'])
@require_auth
def admin_get_leaves():
    """Admin views all leave requests with optional filters."""
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    status_filter = request.args.get('status')
    user_filter = request.args.get('user_id')
    start_after = request.args.get('start_date')
    end_before = request.args.get('end_date')

    query = LeaveRequest.query

    if status_filter:
        query = query.filter_by(status=status_filter)
    if user_filter:
        query = query.filter_by(user_id=user_filter)
    if start_after:
        query = query.filter(LeaveRequest.start_date >= start_after)
    if end_before:
        query = query.filter(LeaveRequest.end_date <= end_before)

    results = query.order_by(LeaveRequest.created_at.desc()).all()

    return jsonify({
        "leave_requests": [r.to_dict() for r in results]
    }), 200


@leave_bp.route('/api/leave/admin/<int:leave_id>', methods=['PUT'])
@require_auth
def admin_review_leave(leave_id):
    """
    Admin approves, rejects, or revokes a leave request.
    - Approve: upsert Attendance records as 'Leave' for each weekday in range
    - Reject: delete auto-created 'Leave' attendance rows (if any)
    - Revoke: same revert logic as Reject (for previously Approved requests)
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    leave_req = LeaveRequest.query.get(leave_id)
    if not leave_req:
        return jsonify({"error": "Leave request not found"}), 404

    body = request.get_json(silent=True) or {}
    new_status = body.get('status')
    admin_comment = body.get('admin_comment', '')

    if new_status not in ('Approved', 'Rejected', 'Revoked'):
        return jsonify({"error": "status must be 'Approved', 'Rejected', or 'Revoked'"}), 400

    # Validate state transitions
    if new_status == 'Approved' and leave_req.status not in ('Pending',):
        return jsonify({"error": f"Cannot approve a request with status '{leave_req.status}'"}), 400

    if new_status == 'Rejected' and leave_req.status not in ('Pending',):
        return jsonify({"error": f"Cannot reject a request with status '{leave_req.status}'"}), 400

    if new_status == 'Revoked' and leave_req.status not in ('Approved',):
        return jsonify({"error": f"Can only revoke an Approved request, current status is '{leave_req.status}'"}), 400

    old_status = leave_req.status

    # Update leave request
    leave_req.status = new_status
    leave_req.admin_comment = admin_comment
    leave_req.reviewed_by = req_supabase_id

    # Attendance integration
    if new_status == 'Approved':
        create_leave_attendance_records(leave_req.user_id, leave_req)
    elif new_status in ('Rejected', 'Revoked'):
        # Only revert if previously Approved (Rejected from Pending has no attendance to revert)
        if old_status == 'Approved' or new_status == 'Revoked':
            revert_leave_attendance_records(leave_req.user_id, leave_req)

    db.session.commit()

    action_word = {'Approved': 'approved', 'Rejected': 'rejected', 'Revoked': 'revoked'}[new_status]

    # Trigger notification to Employee
    try:
        from routes.notification_routes import create_notification
        msg = f"Your {leave_req.leave_type} leave request ({leave_req.start_date} to {leave_req.end_date}) has been {action_word}."
        if admin_comment:
            msg += f" Remarks: {admin_comment}"

        create_notification(
            user_id=leave_req.user_id,
            title=f"Leave Request {new_status}",
            message=msg,
            type='leave'
        )
    except Exception as e:
        print(f"[NOTIFY ERROR] Leave review trigger failed: {str(e)}")

    return jsonify({
        "message": f"Leave request #{leave_id} has been {action_word} successfully",
        "leave_request": leave_req.to_dict()
    }), 200
