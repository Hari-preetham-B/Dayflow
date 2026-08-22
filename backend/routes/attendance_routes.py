from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from models import db, User, Attendance
from auth_middleware import require_auth

attendance_bp = Blueprint('attendance_bp', __name__)

def get_today_str():
    return date.today().strftime('%Y-%m-%d')

@attendance_bp.route('/api/attendance/today', methods=['GET'])
@require_auth
def get_today_attendance():
    """
    Fetch today's check-in/check-out status for the calling employee.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "Requesting user not synced"}), 404

    today_str = get_today_str()
    record = Attendance.query.filter_by(user_id=req_supabase_id, date=today_str).first()

    if not record:
        return jsonify({
            "date": today_str,
            "has_checked_in": False,
            "has_checked_out": False,
            "check_in": None,
            "check_out": None,
            "status": None,
            "duration_hours": 0
        }), 200

    return jsonify({
        "date": today_str,
        "has_checked_in": record.check_in is not None,
        "has_checked_out": record.check_out is not None,
        "check_in": record.check_in.isoformat() if record.check_in else None,
        "check_out": record.check_out.isoformat() if record.check_out else None,
        "status": record.status,
        "duration_hours": record.to_dict()["duration_hours"],
        "record": record.to_dict()
    }), 200


@attendance_bp.route('/api/attendance/check-in', methods=['POST'])
@require_auth
def check_in():
    """
    Record today's check-in timestamp.
    Handles first check-in of the day by creating a fresh row automatically.
    Prevents duplicate check-ins on the same day.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "Requesting user not synced"}), 404

    today_str = get_today_str()
    record = Attendance.query.filter_by(user_id=req_supabase_id, date=today_str).first()

    # Check if already checked in
    if record and record.check_in is not None:
        formatted_time = record.check_in.strftime('%I:%M %p')
        return jsonify({"error": f"Already checked in for today at {formatted_time}"}), 400

    now = datetime.utcnow()

    if not record:
        # Create fresh row on first check-in of the day
        record = Attendance(
            user_id=req_supabase_id,
            date=today_str,
            check_in=now,
            status='Present'
        )
        db.session.add(record)
    else:
        # Update existing record
        record.check_in = now
        record.status = 'Present'

    db.session.commit()

    return jsonify({
        "message": "Checked in successfully!",
        "record": record.to_dict()
    }), 200


@attendance_bp.route('/api/attendance/check-out', methods=['POST'])
@require_auth
def check_out():
    """
    Record today's check-out timestamp.
    Auto-derives status: 'Present' if duration >= 6 hours, 'Half-day' if < 6 hours.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "Requesting user not synced"}), 404

    today_str = get_today_str()
    record = Attendance.query.filter_by(user_id=req_supabase_id, date=today_str).first()

    if not record or record.check_in is None:
        return jsonify({"error": "Cannot check out: You have not checked in for today yet"}), 400

    if record.check_out is not None:
        formatted_time = record.check_out.strftime('%I:%M %p')
        return jsonify({"error": f"Already checked out for today at {formatted_time}"}), 400

    now = datetime.utcnow()
    record.check_out = now

    # Calculate shift duration
    diff = now - record.check_in
    hours = diff.total_seconds() / 3600.0

    if hours >= 6.0:
        record.status = 'Present'
    else:
        record.status = 'Half-day'

    db.session.commit()

    return jsonify({
        "message": f"Checked out successfully! Shift duration: {round(hours, 2)} hours",
        "record": record.to_dict()
    }), 200


@attendance_bp.route('/api/attendance/my', methods=['GET'])
@require_auth
def get_my_attendance():
    """
    Fetch calling employee's personal attendance history and monthly summary metrics.
    Mon-Fri working weekday auto-absent logic runs RETROACTIVELY FOR PAST DATES ONLY, never for today or future dates.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "Requesting user not synced"}), 404

    # Target Year/Month
    now = date.today()
    year = request.args.get('year', default=now.year, type=int)
    month = request.args.get('month', default=now.month, type=int)

    # Fetch existing DB records for user in this month
    prefix = f"{year:04d}-{month:02d}"
    existing_records = Attendance.query.filter(
        Attendance.user_id == req_supabase_id,
        Attendance.date.like(f"{prefix}%")
    ).all()

    record_map = {r.date: r for r in existing_records}

    # Build date range for month
    num_days = 31
    if month in [4, 6, 9, 11]: num_days = 30
    elif month == 2: num_days = 29 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 28

    full_history = []
    present_cnt = 0
    absent_cnt = 0
    half_cnt = 0
    leave_cnt = 0
    total_working_days = 0

    today_curr = date.today()

    for d in range(1, num_days + 1):
        day_date = date(year, month, d)
        date_str = day_date.strftime('%Y-%m-%d')
        is_weekday = day_date.weekday() < 5  # Mon-Fri (0-4)
        is_past = day_date < today_curr

        rec = record_map.get(date_str)

        if rec:
            status = rec.status
            if status == 'Present': present_cnt += 1
            elif status == 'Half-day': half_cnt += 1
            elif status == 'Absent': absent_cnt += 1
            elif status == 'Leave': leave_cnt += 1

            if is_weekday and is_past:
                total_working_days += 1

            full_history.append(rec.to_dict())
        else:
            # RETROACTIVE AUTO-ABSENT FOR PAST WORKING WEEKDAYS ONLY
            if is_weekday and is_past:
                total_working_days += 1
                absent_cnt += 1
                full_history.append({
                    'id': None,
                    'user_id': req_supabase_id,
                    'date': date_str,
                    'check_in': None,
                    'check_out': None,
                    'status': 'Absent',
                    'notes': 'Unrecorded past working weekday (Auto-Absent)',
                    'duration_hours': 0,
                    'user_name': req_user.full_name,
                    'employee_id': req_user.employee_id,
                    'department': req_user.department
                })
            else:
                # Today or future date or weekend without record
                full_history.append({
                    'id': None,
                    'user_id': req_supabase_id,
                    'date': date_str,
                    'check_in': None,
                    'check_out': None,
                    'status': 'Weekend' if not is_weekday else ('Not Checked In' if day_date == today_curr else 'Upcoming'),
                    'notes': None,
                    'duration_hours': 0,
                    'user_name': req_user.full_name,
                    'employee_id': req_user.employee_id,
                    'department': req_user.department
                })

    # Calculate Attendance Rate %
    effective_present = present_cnt + (half_cnt * 0.5)
    denom = max(total_working_days, 1)
    rate = round((effective_present / denom) * 100.0, 1)

    return jsonify({
        "year": year,
        "month": month,
        "history": full_history,
        "summary": {
            "total_working_days": total_working_days,
            "present_days": present_cnt,
            "absent_days": absent_cnt,
            "half_days": half_cnt,
            "leave_days": leave_cnt,
            "attendance_rate": rate
        }
    }), 200


@attendance_bp.route('/api/attendance/admin', methods=['GET'])
@require_auth
def get_admin_attendance():
    """
    Admin-only endpoint to view attendance logs across all employees, filterable by date range, department, user_id.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    department = request.args.get('department')
    target_user_id = request.args.get('user_id')

    query = Attendance.query

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if target_user_id:
        query = query.filter(Attendance.user_id == target_user_id)

    records = query.order_by(Attendance.date.desc()).all()

    # Filter by department if requested
    results = []
    for r in records:
        if department and r.user and r.user.department != department:
            continue
        results.append(r.to_dict())

    return jsonify({"attendance": results}), 200


@attendance_bp.route('/api/attendance/admin/override', methods=['POST'])
@attendance_bp.route('/api/attendance/admin/<int:attendance_id>', methods=['PUT'])
@require_auth
def override_attendance(attendance_id=None):
    """
    Admin-only endpoint to manually correct or create an employee's attendance record for any date.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user or req_user.role != 'admin':
        return jsonify({"error": "Forbidden: Requires Admin privileges"}), 403

    body = request.get_json(silent=True) or {}
    target_user_id = body.get('user_id')
    target_date = body.get('date', get_today_str())
    new_status = body.get('status', 'Present')
    notes = body.get('notes', 'Manual Admin correction')

    if not target_user_id and not attendance_id:
        return jsonify({"error": "user_id or attendance_id is required"}), 400

    record = None
    if attendance_id:
        record = Attendance.query.get(attendance_id)
    elif target_user_id and target_date:
        record = Attendance.query.filter_by(user_id=target_user_id, date=target_date).first()

    if not record:
        if not target_user_id:
            return jsonify({"error": "Target user ID required to create new record"}), 400
        record = Attendance(
            user_id=target_user_id,
            date=target_date,
            status=new_status,
            notes=notes
        )
        db.session.add(record)
    else:
        record.status = new_status
        if notes:
            record.notes = notes

    # Optional manual timestamps
    if 'check_in' in body:
        if body['check_in']:
            record.check_in = datetime.fromisoformat(body['check_in'].replace('Z', '+00:00'))
        else:
            record.check_in = None

    if 'check_out' in body:
        if body['check_out']:
            record.check_out = datetime.fromisoformat(body['check_out'].replace('Z', '+00:00'))
        else:
            record.check_out = None

    db.session.commit()

    return jsonify({
        "message": "Attendance record updated successfully by Admin",
        "record": record.to_dict()
    }), 200
