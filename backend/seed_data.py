import os
import sys
from datetime import datetime, date, timedelta

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, User, EmployeeDocument, Attendance, LeaveRequest, SalaryStructure, SalaryAuditLog, Notification

app = create_app()

def seed_database():
    with app.app_context():
        print("==================================================")
        print("🌱 DAYFLOW HRMS - DEMO & SAMPLE DATA SEEDING")
        print("==================================================")

        # --------------------------------------------------------
        # 1. SEED USERS & PROFILES
        # --------------------------------------------------------
        sample_users_data = [
            {
                "id": "seed-user-admin-001",
                "email": "sarah.jenkins@dayflow.com",
                "role": "admin",
                "employee_id": "EMP-1001",
                "full_name": "Sarah Jenkins",
                "phone": "+1 (555) 019-2831",
                "address": "742 Evergreen Terrace, Springfield, OR",
                "emergency_contact": "Mark Jenkins (+1 555-019-2832)",
                "title": "HR Director",
                "department": "Human Resources",
                "date_of_joining": "2022-01-15",
                "employment_type": "Full-Time",
                "basic_salary": "$95,000 / year",
                "hra": "$18,000 / year",
                "allowances": "$7,000 / year"
            },
            {
                "id": "seed-user-emp-002",
                "email": "john.doe@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1002",
                "full_name": "John Doe",
                "phone": "+1 (555) 014-9921",
                "address": "123 Innovation Way, San Francisco, CA",
                "emergency_contact": "Jane Doe (+1 555-014-9922)",
                "title": "Senior Frontend Engineer",
                "department": "Engineering",
                "date_of_joining": "2023-03-01",
                "employment_type": "Full-Time",
                "basic_salary": "$85,000 / year",
                "hra": "$15,000 / year",
                "allowances": "$5,000 / year"
            },
            {
                "id": "seed-user-emp-003",
                "email": "alex.morgan@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1003",
                "full_name": "Alex Morgan",
                "phone": "+1 (555) 017-8833",
                "address": "456 Silicon Ave, San Jose, CA",
                "emergency_contact": "Chris Morgan (+1 555-017-8834)",
                "title": "Backend Tech Lead",
                "department": "Engineering",
                "date_of_joining": "2022-08-15",
                "employment_type": "Full-Time",
                "basic_salary": "$110,000 / year",
                "hra": "$20,000 / year",
                "allowances": "$8,000 / year"
            },
            {
                "id": "seed-user-emp-004",
                "email": "emily.chen@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1004",
                "full_name": "Emily Chen",
                "phone": "+1 (555) 012-3344",
                "address": "890 Wall Street, New York, NY",
                "emergency_contact": "David Chen (+1 555-012-3345)",
                "title": "Financial Analyst",
                "department": "Finance",
                "date_of_joining": "2023-06-10",
                "employment_type": "Full-Time",
                "basic_salary": "$78,000 / year",
                "hra": "$12,000 / year",
                "allowances": "$4,000 / year"
            },
            {
                "id": "seed-user-emp-005",
                "email": "michael.brown@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1005",
                "full_name": "Michael Brown",
                "phone": "+1 (555) 018-7766",
                "address": "321 Market Street, Chicago, IL",
                "emergency_contact": "Lisa Brown (+1 555-018-7767)",
                "title": "Marketing Lead",
                "department": "Marketing",
                "date_of_joining": "2023-09-01",
                "employment_type": "Full-Time",
                "basic_salary": "$72,000 / year",
                "hra": "$10,000 / year",
                "allowances": "$3,500 / year"
            },
            {
                "id": "seed-user-emp-006",
                "email": "rachel.green@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1006",
                "full_name": "Rachel Green",
                "phone": "+1 (555) 016-5544",
                "address": "654 Broadway, Seattle, WA",
                "emergency_contact": "Monica Geller (+1 555-016-5545)",
                "title": "Operations Manager",
                "department": "Operations",
                "date_of_joining": "2022-11-20",
                "employment_type": "Full-Time",
                "basic_salary": "$80,000 / year",
                "hra": "$14,000 / year",
                "allowances": "$4,500 / year"
            },
            {
                "id": "seed-user-emp-007",
                "email": "david.miller@dayflow.com",
                "role": "employee",
                "employee_id": "EMP-1007",
                "full_name": "David Miller",
                "phone": "+1 (555) 015-4433",
                "address": "987 Pine St, Austin, TX",
                "emergency_contact": "Sarah Miller (+1 555-015-4434)",
                "title": "DevOps Engineer",
                "department": "Engineering",
                "date_of_joining": "2024-01-10",
                "employment_type": "Contract",
                "basic_salary": "$90,000 / year",
                "hra": "$16,000 / year",
                "allowances": "$5,000 / year"
            }
        ]

        seeded_users = {}
        for u_data in sample_users_data:
            existing = User.query.filter_by(email=u_data["email"]).first()
            if not existing:
                u = User(
                    id=u_data["id"],
                    email=u_data["email"],
                    role=u_data["role"],
                    employee_id=u_data["employee_id"],
                    full_name=u_data["full_name"],
                    phone=u_data["phone"],
                    address=u_data["address"],
                    emergency_contact=u_data["emergency_contact"],
                    title=u_data["title"],
                    department=u_data["department"],
                    date_of_joining=u_data["date_of_joining"],
                    employment_type=u_data["employment_type"],
                    basic_salary=u_data["basic_salary"],
                    hra=u_data["hra"],
                    allowances=u_data["allowances"]
                )
                db.session.add(u)
                seeded_users[u_data["email"]] = u
                print(f"  [USER] Created {u_data['role'].upper()}: {u_data['full_name']} ({u_data['email']})")
            else:
                # Update details if already exists
                existing.role = u_data["role"]
                existing.employee_id = u_data["employee_id"]
                existing.full_name = u_data["full_name"]
                existing.phone = u_data["phone"]
                existing.address = u_data["address"]
                existing.emergency_contact = u_data["emergency_contact"]
                existing.title = u_data["title"]
                existing.department = u_data["department"]
                existing.date_of_joining = u_data["date_of_joining"]
                existing.employment_type = u_data["employment_type"]
                existing.basic_salary = u_data["basic_salary"]
                existing.hra = u_data["hra"]
                existing.allowances = u_data["allowances"]
                seeded_users[u_data["email"]] = existing
                print(f"  [USER] Updated {u_data['role'].upper()}: {u_data['full_name']} ({u_data['email']})")

        db.session.commit()

        # Link reporting managers (Sarah Jenkins HR Director is manager for employees)
        admin_user = User.query.filter_by(email="sarah.jenkins@dayflow.com").first()
        if admin_user:
            for u in User.query.filter(User.id != admin_user.id).all():
                u.reporting_manager_id = admin_user.id
            db.session.commit()

        # --------------------------------------------------------
        # 2. SEED DOCUMENTS
        # --------------------------------------------------------
        print("\n📄 Seeding Sample Employee Documents...")
        all_users = User.query.all()
        for u in all_users:
            if EmployeeDocument.query.filter_by(user_id=u.id).count() == 0:
                docs = [
                    EmployeeDocument(
                        user_id=u.id,
                        document_name=f"{u.full_name or 'Employee'}_Government_ID.pdf",
                        document_type="ID Proof",
                        file_url="https://chvbqkggxbyvplfymumr.supabase.co/storage/v1/object/public/employee-documents/sample_id.pdf",
                        file_size="1.4 MB"
                    ),
                    EmployeeDocument(
                        user_id=u.id,
                        document_name=f"{u.full_name or 'Employee'}_Employment_Offer.pdf",
                        document_type="Offer Letter",
                        file_url="https://chvbqkggxbyvplfymumr.supabase.co/storage/v1/object/public/employee-documents/sample_offer.pdf",
                        file_size="2.1 MB"
                    )
                ]
                db.session.add_all(docs)
                print(f"  [DOCS] Added sample documents for {u.full_name or u.email}")
        db.session.commit()

        # --------------------------------------------------------
        # 3. SEED ATTENDANCE HISTORY (Past 14 Days)
        # --------------------------------------------------------
        print("\n⏰ Seeding Sample Attendance History...")
        today = date.today()
        # Generate weekdays for past 14 days
        for i in range(1, 15):
            d = today - timedelta(days=i)
            if d.weekday() >= 5: # Skip weekends
                continue

            day_str = d.strftime('%Y-%m-%d')
            for index, u in enumerate(all_users):
                existing_att = Attendance.query.filter_by(user_id=u.id, date=day_str).first()
                if not existing_att:
                    # Distribute realistic statuses: 80% Present, 10% Half-day, 5% Absent, 5% Leave
                    if (i + index) % 7 == 0:
                        status = 'Absent'
                        check_in_dt = None
                        check_out_dt = None
                        notes = 'Automated absent record'
                    elif (i + index) % 5 == 0:
                        status = 'Half-day'
                        check_in_dt = datetime(d.year, d.month, d.day, 9, 15, 0)
                        check_out_dt = datetime(d.year, d.month, d.day, 13, 30, 0)
                        notes = 'Half day afternoon leave'
                    else:
                        status = 'Present'
                        check_in_dt = datetime(d.year, d.month, d.day, 9, 2, 15)
                        check_out_dt = datetime(d.year, d.month, d.day, 17, 35, 40)
                        notes = 'Regular shift'

                    att = Attendance(
                        user_id=u.id,
                        date=day_str,
                        check_in=check_in_dt,
                        check_out=check_out_dt,
                        status=status,
                        notes=notes
                    )
                    db.session.add(att)
        db.session.commit()
        print("  [ATTENDANCE] Past 14 weekdays populated for all sample employees.")

        # --------------------------------------------------------
        # 4. SEED LEAVE REQUESTS
        # --------------------------------------------------------
        print("\n🌴 Seeding Sample Leave Requests...")
        sample_leaves = [
            {
                "email": "john.doe@dayflow.com",
                "type": "Paid",
                "start": (today + timedelta(days=5)).strftime('%Y-%m-%d'),
                "end": (today + timedelta(days=7)).strftime('%Y-%m-%d'),
                "remarks": "Family vacation and personal downtime.",
                "status": "Pending"
            },
            {
                "email": "alex.morgan@dayflow.com",
                "type": "Sick",
                "start": (today - timedelta(days=8)).strftime('%Y-%m-%d'),
                "end": (today - timedelta(days=8)).strftime('%Y-%m-%d'),
                "remarks": "Severe fever and flu recovery.",
                "status": "Approved"
            },
            {
                "email": "emily.chen@dayflow.com",
                "type": "Unpaid",
                "start": (today - timedelta(days=12)).strftime('%Y-%m-%d'),
                "end": (today - timedelta(days=11)).strftime('%Y-%m-%d'),
                "remarks": "Attending external financial summit.",
                "status": "Approved"
            },
            {
                "email": "michael.brown@dayflow.com",
                "type": "Paid",
                "start": (today + timedelta(days=10)).strftime('%Y-%m-%d'),
                "end": (today + timedelta(days=12)).strftime('%Y-%m-%d'),
                "remarks": "Annual leave request.",
                "status": "Rejected",
                "admin_comment": "Project release scheduled during this period."
            }
        ]

        for l_info in sample_leaves:
            u = User.query.filter_by(email=l_info["email"]).first()
            if u:
                exists = LeaveRequest.query.filter_by(user_id=u.id, start_date=l_info["start"]).first()
                if not exists:
                    lr = LeaveRequest(
                        user_id=u.id,
                        leave_type=l_info["type"],
                        start_date=l_info["start"],
                        end_date=l_info["end"],
                        remarks=l_info["remarks"],
                        status=l_info["status"],
                        admin_comment=l_info.get("admin_comment")
                    )
                    db.session.add(lr)
                    print(f"  [LEAVE] Created {l_info['status']} {l_info['type']} leave for {u.full_name}")
        db.session.commit()

        # --------------------------------------------------------
        # 5. SEED SALARY STRUCTURES & AUDIT LOGS
        # --------------------------------------------------------
        print("\n💵 Seeding Sample Salary Structures & Audit Logs...")
        salary_config = [
            {"email": "sarah.jenkins@dayflow.com", "basic": 7000.0, "allowances": 1500.0, "deductions": 800.0},
            {"email": "john.doe@dayflow.com", "basic": 6500.0, "allowances": 1200.0, "deductions": 650.0},
            {"email": "alex.morgan@dayflow.com", "basic": 8500.0, "allowances": 1800.0, "deductions": 950.0},
            {"email": "emily.chen@dayflow.com", "basic": 5800.0, "allowances": 1000.0, "deductions": 500.0},
            {"email": "michael.brown@dayflow.com", "basic": 5500.0, "allowances": 900.0, "deductions": 450.0},
            {"email": "rachel.green@dayflow.com", "basic": 6000.0, "allowances": 1100.0, "deductions": 550.0},
            {"email": "david.miller@dayflow.com", "basic": 6800.0, "allowances": 1300.0, "deductions": 700.0}
        ]

        for s_info in salary_config:
            u = User.query.filter_by(email=s_info["email"]).first()
            if u:
                sal = SalaryStructure.query.filter_by(user_id=u.id).first()
                if not sal:
                    sal = SalaryStructure(
                        user_id=u.id,
                        basic_pay=s_info["basic"],
                        allowances=s_info["allowances"],
                        deductions=s_info["deductions"],
                        effective_date="2026-01-01"
                    )
                    db.session.add(sal)
                    db.session.flush()

                    # Audit log record
                    if admin_user:
                        audit = SalaryAuditLog(
                            salary_structure_id=sal.id,
                            user_id=u.id,
                            changed_by=admin_user.id,
                            action='CREATE',
                            old_values=None,
                            new_values=f'{{"basic_pay": {sal.basic_pay}, "allowances": {sal.allowances}, "deductions": {sal.deductions}, "net_pay": {sal.net_pay}}}'
                        )
                        db.session.add(audit)
                    print(f"  [SALARY] Initialized compensation structure & audit log for {u.full_name} (${sal.net_pay:,.2f}/mo)")
        db.session.commit()

        # --------------------------------------------------------
        # 6. SEED NOTIFICATIONS
        # --------------------------------------------------------
        print("\n🔔 Seeding Sample In-App Notifications...")
        for u in all_users:
            if Notification.query.filter_by(user_id=u.id).count() == 0:
                if u.role == 'admin':
                    n1 = Notification(
                        user_id=u.id,
                        title="New Leave Request Submitted",
                        message="John Doe submitted a Paid leave request (5 days).",
                        type="leave",
                        is_read=False
                    )
                    n2 = Notification(
                        user_id=u.id,
                        title="New Document Uploaded",
                        message="Alex Morgan uploaded a new document: Alex_Morgan_Government_ID.pdf.",
                        type="document",
                        is_read=True
                    )
                else:
                    n1 = Notification(
                        user_id=u.id,
                        title="Welcome to Dayflow HRMS",
                        message="Your profile and compensation structures have been initialized.",
                        type="system",
                        is_read=False
                    )
                    n2 = Notification(
                        user_id=u.id,
                        title="Leave Request Update",
                        message="Your recent Sick leave request was approved by Sarah Jenkins.",
                        type="leave",
                        is_read=True
                    )
                db.session.add_all([n1, n2])
        db.session.commit()

        print("==================================================")
        print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("==================================================")

if __name__ == '__main__':
    seed_database()
