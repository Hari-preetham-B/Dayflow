from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(100), primary_key=True)  # Supabase Auth UUID
    email = db.Column(db.String(255), unique=True, nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False, default='employee')  # 'admin' or 'employee'
    department = db.Column(db.String(100), default='General')
    title = db.Column(db.String(100), default='Team Member')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'employee_id': self.employee_id,
            'role': self.role,
            'department': self.department,
            'title': self.title,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
