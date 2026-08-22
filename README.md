# Dayflow — Human Resource Management System (HRMS)

Dayflow is an enterprise-grade, full-stack Human Resource Management System built to streamline employee operations, role-based access control, profile management, attendance tracking, leave requests, salary administration, in-app notifications, and workforce analytics.

---

## 🌟 Tech Stack

- **Backend**: Python 3.13, Flask 3.0, SQLAlchemy ORM, PostgreSQL (`psycopg2-binary`), ReportLab 5.0 (PDF generation), Brevo/SMTP Mailer
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM v6
- **Database**: Supabase PostgreSQL (Live serverless cloud database instance)
- **Authentication**: Supabase Auth (JWT bearer token validation, password strength policies, auto-admin bootstrapping)
- **Storage**: Supabase Storage (`employee-documents` bucket)
- **PDF & Exports**: ReportLab (Salary Slips), CSV streaming exports (Attendance & Leave reports)

---

## 🏗️ Architecture & Project Structure

```
Dayflow/
├── backend/
│   ├── app.py                 # Flask app factory, CORS, blueprint registration & health check
│   ├── config.py              # Configuration manager & database credentials
│   ├── models.py              # User, EmployeeDocument, Attendance, LeaveRequest, SalaryStructure, SalaryAuditLog, Notification models
│   ├── auth_middleware.py     # Supabase JWT token verification & role enforcement middleware
│   ├── routes/
│   │   ├── auth_routes.py     # Supabase profile sync & auto-admin bootstrap (/api/auth/sync)
│   │   ├── admin_routes.py    # Admin user directory & role promotion (/api/admin/...)
│   │   ├── profile_routes.py  # Profile CRUD, role field whitelisting & document management
│   │   ├── attendance_routes.py # Check-in/out, auto-status derivation, attendance history & admin overrides
│   │   ├── leave_routes.py    # Leave applications, date overlap validation & approval/revocation flow
│   │   ├── salary_routes.py   # Employee salary view, admin CRUD, net_pay calculation & audit logs
│   │   ├── notification_routes.py # In-app notification endpoints & Brevo/SMTP email helper
│   │   └── analytics_routes.py # Analytics dashboard KPIs, CSV exports & ReportLab PDF generator
│   ├── requirements.txt       # Backend Python dependencies
│   └── .env                   # Backend environment variables
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx # Global Supabase Auth & role state provider
    │   ├── lib/
    │   │   ├── api.js          # Encapsulated API client for Salary, Notifications, Analytics & Exports
    │   │   ├── supabase.js     # Supabase JS client initialization
    │   │   └── supabaseStorage.js # File validation & Supabase Storage upload helper
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx  # Route guard with admin role restriction
    │   │   └── NotificationDrawer.jsx # Header in-app notification drawer with unread counter
    │   ├── pages/
    │   │   ├── SignIn.jsx           # Sign in page with specific error messages
    │   │   ├── SignUp.jsx           # Sign up page with password strength indicator
    │   │   ├── EmployeeDashboard.jsx# Employee workspace & quick-access cards
    │   │   ├── AdminDashboard.jsx   # Admin & HR control portal
    │   │   ├── ProfilePage.jsx      # Role-based profile management & document records
    │   │   ├── AttendancePage.jsx   # Check-in/out, status derivation & admin overrides
    │   │   ├── LeavePage.jsx        # Apply for leave, overlap checks & approval table
    │   │   ├── SalaryPage.jsx       # Read-only employee salary & admin salary management
    │   │   └── AnalyticsPage.jsx    # Analytics KPIs, date filters, CSV exports & PDF downloads
    │   ├── App.jsx            # React Router protected routes configuration
    │   └── index.css          # Tailored HR glassmorphic design system
    ├── package.json
    └── .env                   # Frontend environment variables
```

---

## ⚡ Feature Summary by Phase

### Phase 0 & 1: Core Foundation & Profile Management
- **Supabase Authentication**: Standardized JWT bearer token authentication with password policy enforcement.
- **Auto-Admin Bootstrap**: First user to register automatically becomes `admin`; subsequent registrations default to `employee`.
- **Server-Side Field Whitelisting**: Profile updates strictly limit non-admins to basic fields (`full_name`, `phone`, `address`, `emergency_contact`, `avatar_url`), ignoring admin-only fields (`basic_salary`, `title`, `department`, `role`).
- **Document Management**: Multi-file document metadata records linked to Supabase Storage with strict user ownership protection.

### Phase 2: Attendance Management
- **Check-in / Check-out**: Interactive check-in/out buttons with duplicate check-in prevention.
- **Automatic Status Derivation**:
  - `Present`: Working hours >= 7.5 hours
  - `Half-day`: Working hours >= 4.0 and < 7.5 hours
  - `Absent`: Past working weekdays (Mon–Fri) without check-in
  - `Leave`: Approved leave days automatically populate as `Leave` status
- **Admin Overrides**: Admins can edit check-in/out times or manually force status for any employee date.

### Phase 3: Leave & Time-Off Management
- **Leave Application**: Employees can apply for `Paid`, `Sick`, or `Unpaid` leave with date ranges and remarks.
- **Date Overlap Validation**: Server checks and rejects requests overlapping with existing `Pending` or `Approved` leave.
- **Admin Review Flow**: Admins can approve, reject, or revoke requests. Approving automatically generates `Leave` attendance records for weekdays in range.

### Phase 4: Salary Management
- **Employee View**: Read-only breakdown of Basic Pay, Allowances, Deductions, Net Pay, and Effective Date.
- **Admin Salary CRUD**: Admins can configure compensation structures with automatic server-side `net_pay = basic_pay + allowances - deductions` calculation.
- **Audit Trail**: Full audit logging of all CREATE, UPDATE, and DELETE actions storing actor details, timestamp, and JSON diffs.

### Phase 5: Notifications, Analytics & Final Polish
- **In-App & Email Notifications**: Automatic notifications triggered on leave applications (to Admins), leave status updates (to Employee), and document uploads (to Admins). Includes a header drawer component with unread badges and Brevo/SMTP email fallback.
- **Analytics & Reports Dashboard**: Interactive date-range filters showing organization-wide or personal KPIs for Attendance, Leave requests, and Salary compensation outlays.
- **ReportLab Salary Slip PDF**: Downloadable official PDF salary slips formatted with employee info, breakdown table, and net take-home pay.
- **CSV Data Exports**: Export Attendance and Leave data to downloadable CSV files respecting date and role filters.

---

## 🔐 Role Permission Matrix

| Feature / Action | Employee | Admin / HR |
|---|:---:|:---:|
| Sign Up & Authentication | ✅ | ✅ |
| View Own Profile & Documents | ✅ | ✅ |
| Edit Own Contact Details | ✅ | ✅ |
| Edit Salary / Designation / Role | ❌ (Server-blocked) | ✅ |
| Check-in / Check-out Attendance | ✅ | ✅ |
| Admin Override Attendance | ❌ | ✅ |
| Submit Leave Request | ✅ | ✅ |
| Approve / Reject / Revoke Leaves | ❌ | ✅ |
| View Own Salary Breakdown | ✅ (Read-only) | ✅ |
| Manage Compensation & Audit Logs | ❌ | ✅ |
| View Notifications & Mark Read | ✅ (Own) | ✅ (All & Admin Alerts) |
| Export Attendance & Leave CSV | ✅ (Own records) | ✅ (All records / Filtered) |
| Download Salary Slip PDF | ✅ (Own slip) | ✅ (All employees) |

---

## ⚙️ Environment Configuration

> [!CAUTION]
> **Never commit real credentials to this repository.** All values below are placeholders.
> If a real password was ever committed, rotate it immediately in the Supabase Dashboard → Database → Settings.

### 1. Backend (`backend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=change_me_to_a_random_secret
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Brevo SMTP Configuration (Optional)
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
BREVO_USER=your_brevo_login_email
BREVO_API_KEY=your_brevo_smtp_key
SENDER_EMAIL=no-reply@dayflow.com
```

### 2. Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 Running the Application Locally

### Step 1: Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask backend server
python app.py
```
*Backend runs on `http://localhost:5000` and automatically connects to Supabase Postgres.*

---

### Step 2: Start Frontend Application
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Verification & Build Checks

- **Backend Startup Verification**:
  ```bash
  python.exe -c "import app"
  ```
- **Frontend Production Build**:
  ```bash
  npm run build
  ```
