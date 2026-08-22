from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(100), primary_key=True)  # Supabase Auth UUID
    email = db.Column(db.String(255), unique=True, nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False, default='employee')  # 'admin' or 'employee'
    
    # Profile & Personal Details
    full_name = db.Column(db.String(150), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    address = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(150), nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)

    # Job Details
    department = db.Column(db.String(100), default='General')
    title = db.Column(db.String(100), default='Team Member')  # Designation
    date_of_joining = db.Column(db.String(50), default='2024-01-15')
    employment_type = db.Column(db.String(50), default='Full-Time')  # 'Full-Time', 'Part-Time', 'Contract'
    reporting_manager_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=True)

    # Salary Structure (Display fields)
    basic_salary = db.Column(db.String(50), default='$65,000 / year')
    hra = db.Column(db.String(50), default='$15,000 / year')
    allowances = db.Column(db.String(50), default='$10,000 / year')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    reporting_manager = db.relationship('User', remote_side=[id], backref=db.backref('direct_reports', lazy=True))
    documents = db.relationship('EmployeeDocument', backref='owner', lazy=True, cascade="all, delete-orphan")

    def __init__(self, id=None, email=None, employee_id=None, role='employee', 
                 full_name=None, phone=None, address=None, emergency_contact=None, avatar_url=None,
                 department='General', title='Team Member', date_of_joining='2024-01-15',
                 employment_type='Full-Time', reporting_manager_id=None,
                 basic_salary='$65,000 / year', hra='$15,000 / year', allowances='$10,000 / year',
                 created_at=None, **kwargs):
        super(User, self).__init__(**kwargs)
        if id is not None: self.id = id
        if email is not None: self.email = email
        if employee_id is not None: self.employee_id = employee_id
        if role is not None: self.role = role
        
        self.full_name = full_name or (email.split('@')[0].replace('.', ' ').title() if email else "Employee")
        self.phone = phone or "+1 (555) 019-2834"
        self.address = address or "123 Innovation Way, Tech District, Suite 400"
        self.emergency_contact = emergency_contact or "Jane Doe (Spouse) - +1 (555) 019-9999"
        self.avatar_url = avatar_url

        if department is not None: self.department = department
        if title is not None: self.title = title
        if date_of_joining is not None: self.date_of_joining = date_of_joining
        if employment_type is not None: self.employment_type = employment_type
        if reporting_manager_id is not None: self.reporting_manager_id = reporting_manager_id

        if basic_salary is not None: self.basic_salary = basic_salary
        if hra is not None: self.hra = hra
        if allowances is not None: self.allowances = allowances
        if created_at is not None: self.created_at = created_at

    def to_dict(self, include_documents=False):
        manager_info = None
        if self.reporting_manager:
            manager_info = {
                'id': self.reporting_manager.id,
                'full_name': self.reporting_manager.full_name or self.reporting_manager.email,
                'email': self.reporting_manager.email,
                'employee_id': self.reporting_manager.employee_id
            }

        data = {
            'id': self.id,
            'email': self.email,
            'employee_id': self.employee_id,
            'role': self.role,
            'full_name': self.full_name or (self.email.split('@')[0].replace('.', ' ').title() if self.email else "Employee"),
            'phone': self.phone or "+1 (555) 019-2834",
            'address': self.address or "123 Innovation Way, Tech District, Suite 400",
            'emergency_contact': self.emergency_contact or "Jane Doe (Spouse) - +1 (555) 019-9999",
            'avatar_url': self.avatar_url,
            'department': self.department,
            'title': self.title,
            'date_of_joining': self.date_of_joining,
            'employment_type': self.employment_type,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager': manager_info,
            'salary_structure': {
                'basic_salary': self.basic_salary or '$65,000 / year',
                'hra': self.hra or '$15,000 / year',
                'allowances': self.allowances or '$10,000 / year'
            },
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_documents:
            data['documents'] = [doc.to_dict() for doc in self.documents]

        return data


class EmployeeDocument(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(100), default='General')  # 'ID Proof', 'Certificate', 'Contract'
    file_url = db.Column(db.Text, nullable=False)
    file_size = db.Column(db.String(50), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, user_id=None, document_name=None, document_type='General', 
                 file_url=None, file_size=None, created_at=None, **kwargs):
        super(EmployeeDocument, self).__init__(**kwargs)
        if user_id is not None: self.user_id = user_id
        if document_name is not None: self.document_name = document_name
        if document_type is not None: self.document_type = document_type
        if file_url is not None: self.file_url = file_url
        if file_size is not None: self.file_size = file_size
        if created_at is not None: self.uploaded_at = created_at

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'document_name': self.document_name,
            'document_type': self.document_type,
            'file_url': self.file_url,
            'file_size': self.file_size or '1.2 MB',
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # 'YYYY-MM-DD'
    check_in = db.Column(db.DateTime, nullable=True)
    check_out = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Present')  # 'Present', 'Absent', 'Half-day', 'Leave'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('attendances', lazy=True, cascade="all, delete-orphan"))

    def __init__(self, user_id=None, date=None, check_in=None, check_out=None, 
                 status='Present', notes=None, created_at=None, **kwargs):
        super(Attendance, self).__init__(**kwargs)
        if user_id is not None: self.user_id = user_id
        if date is not None: self.date = date
        if check_in is not None: self.check_in = check_in
        if check_out is not None: self.check_out = check_out
        if status is not None: self.status = status
        if notes is not None: self.notes = notes
        if created_at is not None: self.created_at = created_at

    def to_dict(self):
        duration_hours = 0
        if self.check_in and self.check_out:
            diff = self.check_out - self.check_in
            duration_hours = round(diff.total_seconds() / 3600.0, 2)
        elif self.check_in:
            diff = datetime.utcnow() - self.check_in
            duration_hours = round(diff.total_seconds() / 3600.0, 2)

        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date,
            'check_in': self.check_in.isoformat() if self.check_in else None,
            'check_out': self.check_out.isoformat() if self.check_out else None,
            'status': self.status,
            'notes': self.notes,
            'duration_hours': duration_hours,
            'user_name': self.user.full_name or self.user.email if self.user else None,
            'employee_id': self.user.employee_id if self.user else None,
            'department': self.user.department if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    leave_type = db.Column(db.String(50), nullable=False)  # 'Paid', 'Sick', 'Unpaid'
    start_date = db.Column(db.String(20), nullable=False)   # 'YYYY-MM-DD'
    end_date = db.Column(db.String(20), nullable=False)     # 'YYYY-MM-DD'
    remarks = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Pending')  # 'Pending', 'Approved', 'Rejected', 'Revoked'
    admin_comment = db.Column(db.Text, nullable=True)
    reviewed_by = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('leave_requests', lazy=True))
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name or self.user.email if self.user else None,
            'employee_id': self.user.employee_id if self.user else None,
            'department': self.user.department if self.user else None,
            'leave_type': self.leave_type,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'remarks': self.remarks,
            'status': self.status,
            'admin_comment': self.admin_comment,
            'reviewed_by': self.reviewed_by,
            'reviewer_name': self.reviewer.full_name if self.reviewer else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

