import io
import csv
from datetime import datetime, date
from flask import Blueprint, request, jsonify, Response
from models import db, User, Attendance, LeaveRequest, SalaryStructure
from auth_middleware import require_auth

# ReportLab Imports for PDF Generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

analytics_bp = Blueprint('analytics_bp', __name__)


# ============================================================
# 1. ANALYTICS & REPORTS DASHBOARD SUMMARY
# ============================================================

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
@require_auth
def get_analytics_dashboard():
    """
    Returns high-level summary KPIs for Attendance, Leaves, and Salaries.
    Supports optional date-range filtering (start_date, end_date).
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    is_admin = (req_user.role == 'admin')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # ------------------ ATTENDANCE KPI ------------------
    att_query = Attendance.query
    if not is_admin:
        att_query = att_query.filter_by(user_id=req_supabase_id)
    if start_date:
        att_query = att_query.filter(Attendance.date >= start_date)
    if end_date:
        att_query = att_query.filter(Attendance.date <= end_date)

    att_records = att_query.all()
    present_cnt = sum(1 for a in att_records if a.status == 'Present')
    absent_cnt = sum(1 for a in att_records if a.status == 'Absent')
    half_day_cnt = sum(1 for a in att_records if a.status == 'Half-day')
    leave_cnt = sum(1 for a in att_records if a.status == 'Leave')
    total_att = len(att_records)

    effective_present = present_cnt + (0.5 * half_day_cnt)
    att_percentage = round((effective_present / total_att * 100), 1) if total_att > 0 else 0.0

    # ------------------ LEAVE KPI ------------------
    leave_query = LeaveRequest.query
    if not is_admin:
        leave_query = leave_query.filter_by(user_id=req_supabase_id)
    if start_date:
        leave_query = leave_query.filter(LeaveRequest.start_date >= start_date)
    if end_date:
        leave_query = leave_query.filter(LeaveRequest.end_date <= end_date)

    leave_records = leave_query.all()
    total_leaves = len(leave_records)
    pending_leaves = sum(1 for l in leave_records if l.status == 'Pending')
    approved_leaves = sum(1 for l in leave_records if l.status == 'Approved')
    rejected_leaves = sum(1 for l in leave_records if l.status == 'Rejected')

    leave_type_breakdown = {
        'Paid': sum(1 for l in leave_records if l.leave_type == 'Paid'),
        'Sick': sum(1 for l in leave_records if l.leave_type == 'Sick'),
        'Unpaid': sum(1 for l in leave_records if l.leave_type == 'Unpaid')
    }

    # ------------------ SALARY KPI ------------------
    salary_query = SalaryStructure.query
    if not is_admin:
        salary_query = salary_query.filter_by(user_id=req_supabase_id)

    salaries = salary_query.all()
    total_basic = sum(s.basic_pay for s in salaries)
    total_allowances = sum(s.allowances for s in salaries)
    total_deductions = sum(s.deductions for s in salaries)
    total_net = sum(s.net_pay for s in salaries)

    return jsonify({
        "attendance": {
            "total_records": total_att,
            "present": present_cnt,
            "absent": absent_cnt,
            "half_day": half_day_cnt,
            "leave": leave_cnt,
            "attendance_percentage": att_percentage
        },
        "leave": {
            "total_requests": total_leaves,
            "pending": pending_leaves,
            "approved": approved_leaves,
            "rejected": rejected_leaves,
            "type_breakdown": leave_type_breakdown
        },
        "salary": {
            "total_count": len(salaries),
            "total_basic_pay": total_basic,
            "total_allowances": total_allowances,
            "total_deductions": total_deductions,
            "total_net_pay": total_net
        }
    }), 200


# ============================================================
# 2. CSV EXPORT ENDPOINTS
# ============================================================

@analytics_bp.route('/api/analytics/export/attendance', methods=['GET'])
@require_auth
def export_attendance_csv():
    """
    Exports Attendance data as CSV.
    Admins can export all or filter by user_id/date/status.
    Employees can export only their own attendance data.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    is_admin = (req_user.role == 'admin')
    user_filter = request.args.get('user_id')
    status_filter = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Attendance.query

    if not is_admin:
        query = query.filter_by(user_id=req_supabase_id)
    elif user_filter:
        query = query.filter_by(user_id=user_filter)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Record ID', 'Employee Name', 'Employee ID', 'Date', 'Status', 'Check-In', 'Check-Out', 'Notes'])

    for r in records:
        emp = r.user
        emp_name = emp.full_name or emp.email if emp else 'Unknown'
        emp_id = emp.employee_id if emp else ''
        writer.writerow([r.id, emp_name, emp_id, r.date, r.status, r.check_in or '', r.check_out or '', r.notes or ''])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
    )


@analytics_bp.route('/api/analytics/export/leave', methods=['GET'])
@require_auth
def export_leave_csv():
    """
    Exports Leave Request data as CSV.
    Admins can export all or filter by user_id/date/status.
    Employees can export only their own leave requests.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    is_admin = (req_user.role == 'admin')
    user_filter = request.args.get('user_id')
    status_filter = request.args.get('status')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = LeaveRequest.query

    if not is_admin:
        query = query.filter_by(user_id=req_supabase_id)
    elif user_filter:
        query = query.filter_by(user_id=user_filter)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if start_date:
        query = query.filter(LeaveRequest.start_date >= start_date)
    if end_date:
        query = query.filter(LeaveRequest.end_date <= end_date)

    records = query.order_by(LeaveRequest.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Leave ID', 'Employee Name', 'Employee ID', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Remarks', 'Admin Comment'])

    for r in records:
        emp = r.user
        emp_name = emp.full_name or emp.email if emp else 'Unknown'
        emp_id = emp.employee_id if emp else ''
        writer.writerow([r.id, emp_name, emp_id, r.leave_type, r.start_date, r.end_date, r.status, r.remarks or '', r.admin_comment or ''])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment; filename=leave_report.csv"}
    )


# ============================================================
# 3. REPORTLAB SALARY SLIP PDF GENERATION
# ============================================================

@analytics_bp.route('/api/salary/slip/my', methods=['GET'])
@analytics_bp.route('/api/salary/slip/<target_user_id>', methods=['GET'])
@require_auth
def download_salary_slip_pdf(target_user_id=None):
    """
    Generates an official Salary Slip PDF using ReportLab.
    Employees can download ONLY their own salary slip.
    Admins can download any employee's salary slip.
    """
    req_supabase_id = request.supabase_user.get("id")
    req_user = User.query.get(req_supabase_id)
    if not req_user:
        return jsonify({"error": "User not synced"}), 404

    target_id = target_user_id or req_supabase_id

    # Security & Role check
    if req_user.role != 'admin' and target_id != req_supabase_id:
        return jsonify({"error": "Forbidden: You can only download your own salary slip"}), 403

    target_user = User.query.get(target_id)
    if not target_user:
        return jsonify({"error": "Target employee profile not found"}), 404

    salary = SalaryStructure.query.filter_by(user_id=target_id).first()
    if not salary:
        return jsonify({"error": "No salary structure configured for this employee"}), 404

    # Build PDF buffer with ReportLab
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0f172a")    # Slate 900
    ACCENT = colors.HexColor("#059669")     # Emerald 600
    LIGHT_BG = colors.HexColor("#f8fafc")   # Slate 50
    TEXT_DARK = colors.HexColor("#1e293b")  # Slate 800
    TEXT_MUTED = colors.HexColor("#64748b") # Slate 500
    BORDER_COLOR = colors.HexColor("#cbd5e1") # Slate 300

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=TEXT_MUTED,
        fontName='Helvetica',
        spaceAfter=15
    )

    label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=TEXT_MUTED)
    val_style = ParagraphStyle('ValStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica', textColor=TEXT_DARK)
    num_style = ParagraphStyle('NumStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', textColor=TEXT_DARK, alignment=2)
    header_style = ParagraphStyle('HeaderStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold', textColor=colors.white)

    elements = []

    # Title & Subtitle Header
    elements.append(Paragraph("DAYFLOW HRMS", title_style))
    elements.append(Paragraph("Official Monthly Salary Slip & Compensation Summary", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=0, spaceAfter=15))

    # Employee Information Block
    emp_info_data = [
        [
            Paragraph("<b>Employee Name:</b>", label_style),
            Paragraph(target_user.full_name or target_user.email, val_style),
            Paragraph("<b>Effective Date:</b>", label_style),
            Paragraph(salary.effective_date, val_style)
        ],
        [
            Paragraph("<b>Employee ID:</b>", label_style),
            Paragraph(target_user.employee_id or 'N/A', val_style),
            Paragraph("<b>Department:</b>", label_style),
            Paragraph(target_user.department or 'General', val_style)
        ],
        [
            Paragraph("<b>Job Title:</b>", label_style),
            Paragraph(target_user.title or 'Employee', val_style),
            Paragraph("<b>Email:</b>", label_style),
            Paragraph(target_user.email, val_style)
        ]
    ]

    emp_info_table = Table(emp_info_data, colWidths=[110, 160, 110, 150])
    emp_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(emp_info_table)
    elements.append(Spacer(1, 20))

    # Salary Breakdown Table
    table_headers = [
        Paragraph("Compensation Component", header_style),
        Paragraph("Type", header_style),
        Paragraph("Amount ($)", ParagraphStyle('HRight', parent=header_style, alignment=2))
    ]

    salary_rows = [
        table_headers,
        [Paragraph("Basic Pay", val_style), Paragraph("Base Compensation", label_style), Paragraph(f"${salary.basic_pay:,.2f}", num_style)],
        [Paragraph("Allowances", val_style), Paragraph("Benefits / HRA / Transport", label_style), Paragraph(f"${salary.allowances:,.2f}", num_style)],
        [Paragraph("Deductions", val_style), Paragraph("Taxes & Contributions", label_style), Paragraph(f"-${salary.deductions:,.2f}", num_style)],
        [Paragraph("<b>NET TAKE-HOME PAY</b>", ParagraphStyle('NetLbl', parent=styles['Normal'], fontSize=11, fontName='Helvetica-Bold', textColor=ACCENT)),
         Paragraph("Final Monthly Pay", ParagraphStyle('NetSub', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=ACCENT)),
         Paragraph(f"<b>${salary.net_pay:,.2f}</b>", ParagraphStyle('NetVal', parent=styles['Normal'], fontSize=12, fontName='Helvetica-Bold', textColor=ACCENT, alignment=2))]
    ]

    sal_table = Table(salary_rows, colWidths=[220, 180, 130])
    sal_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('BACKGROUND', (0,2), (-1,2), LIGHT_BG),
        ('BACKGROUND', (0,3), (-1,3), colors.white),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor("#ecfdf5")), # Soft emerald tint
        ('LINEABOVE', (0,4), (-1,4), 1.5, ACCENT),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    elements.append(sal_table)
    elements.append(Spacer(1, 30))

    # Disclaimer / Footer
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=10, spaceAfter=10))
    footer_text = Paragraph(
        "<i>This document is a computer-generated salary slip from Dayflow HRMS. "
        "No signature is required. For inquiries regarding deductions or allowances, please contact Finance/HR.</i>",
        ParagraphStyle('FooterText', parent=styles['Normal'], fontSize=8, textColor=TEXT_MUTED, alignment=1)
    )
    elements.append(footer_text)

    # Build document
    doc.build(elements)
    pdf_buffer.seek(0)

    filename = f"SalarySlip_{target_user.employee_id or 'Emp'}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(
        pdf_buffer.getvalue(),
        mimetype='application/pdf',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
