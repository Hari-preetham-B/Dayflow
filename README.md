<div align="center">
  <a name="top"></a>
  <h1><font color="#4F46E5">⚡ Dayflow</font> — <font color="#7C3AED">Human Resource Management System (HRMS)</font></h1>
  <p><strong><font color="#06B6D4">Every workday, perfectly aligned.</font></strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask 3.0">
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL">
    <img src="https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white" alt="Build Passing">
    <img src="https://img.shields.io/badge/Made_for-ODOOXNMIT-7C3AED?style=for-the-badge&logo=hackster&logoColor=white" alt="Made for ODOOXNMIT">
  </p>

  <p>
    <a href="https://readme-typing-svg.demolab.com/?lines=Role-based+HR+workflows;Real-time+attendance+tracking;Approval+workflows+that+don%27t+suck;Automated+payroll+computation&font=Inter&size=18&center=true&vCenter=true&width=500&height=40&color=4F46E5">
      <img src="https://readme-typing-svg.demolab.com/?lines=Role-based+HR+workflows;Real-time+attendance+tracking;Approval+workflows+that+don%27t+suck;Automated+payroll+computation&font=Inter&size=18&center=true&vCenter=true&width=500&height=40&color=4F46E5" alt="Typing SVG">
    </a>
  </p>
</div>

Dayflow is an enterprise-grade, full-stack Human Resource Management System built to streamline employee operations, role-based access control, profile management, attendance tracking, leave requests, salary administration, in-app notifications, and workforce analytics.

---

## 📸 Demo

<details>
<summary>Click to expand application screen previews</summary>

<br />

| Screen | Preview |
| :--- | :--- |
| **Login / Sign In** | ![Login Screen](assets/screenshot-login.png) <!-- TODO: replace with real screenshot of Login Screen --> |
| **Employee Dashboard** | ![Employee Dashboard](assets/screenshot-employee-dashboard.png) <!-- TODO: replace with real screenshot of Employee Dashboard --> |
| **Admin Control Portal** | ![Admin Dashboard](assets/screenshot-admin-dashboard.png) <!-- TODO: replace with real screenshot of Admin Dashboard --> |
| **Attendance & Shift Management** | ![Attendance Screen](assets/screenshot-attendance.png) <!-- TODO: replace with real screenshot of Attendance Screen --> |
| **Leave & Time-Off Request** | ![Leave Management](assets/screenshot-leave.png) <!-- TODO: replace with real screenshot of Leave Management Screen --> |
| **Salary & Payroll Management** | ![Salary Management](assets/screenshot-salary.png) <!-- TODO: replace with real screenshot of Salary & Payroll Screen --> |

</details>

---

## 🌟 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | ![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=flat-square&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask_3.0-000000?style=flat-square&logo=flask&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy_3.1-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white) | Core REST API backend framework & ORM data access layer |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) | Serverless cloud database instance & Supabase Storage bucket |
| **Frontend** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Single Page Application (SPA) client architecture & routing |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F59E0B?style=flat-square&logo=lucide&logoColor=white) | Tailored HR glassmorphic design system & UI icons |
| **PDF & Exports** | ![ReportLab](https://img.shields.io/badge/ReportLab_5.0-3776AB?style=flat-square&logo=python&logoColor=white) | Official PDF salary slip generation & streaming CSV exports |
| **Mailer** | ![Brevo](https://img.shields.io/badge/Brevo_SMTP-0092FF?style=flat-square&logo=brevo&logoColor=white) | Transactional email alert delivery fallback |

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

<div align="center">
  <img src="https://img.shields.io/badge/🏆-All_5_Phases_Shipped-brightgreen?style=for-the-badge" alt="All 5 Phases Shipped">
</div>

<br />

<details open>
<summary><b>Phase 0 & 1: Core Foundation & Profile Management</b> <img src="https://img.shields.io/badge/Phase_0_%26_1-100%25_Complete-brightgreen?style=flat-square" alt="Phase 0 & 1 Complete"></summary>

<br />

- **Supabase Authentication**: Standardized JWT bearer token authentication with password policy enforcement.
- **Auto-Admin Bootstrap**: First user to register automatically becomes `admin`; subsequent registrations default to `employee`.
- **Server-Side Field Whitelisting**: Profile updates strictly limit non-admins to basic fields (`full_name`, `phone`, `address`, `emergency_contact`, `avatar_url`), ignoring admin-only fields (`basic_salary`, `title`, `department`, `role`).
- **Document Management**: Multi-file document metadata records linked to Supabase Storage with strict user ownership protection.

</details>

<details>
<summary><b>Phase 2: Attendance Management</b> <img src="https://img.shields.io/badge/Phase_2-100%25_Complete-brightgreen?style=flat-square" alt="Phase 2 Complete"></summary>

<br />

- **Check-in / Check-out**: Interactive check-in/out buttons with duplicate check-in prevention.
- **Automatic Status Derivation**:
  - `Present`: Working hours >= 7.5 hours
  - `Half-day`: Working hours >= 4.0 and < 7.5 hours
  - `Absent`: Past working weekdays (Mon–Fri) without check-in
  - `Leave`: Approved leave days automatically populate as `Leave` status
- **Admin Overrides**: Admins can edit check-in/out times or manually force status for any employee date.

</details>

<details>
<summary><b>Phase 3: Leave & Time-Off Management</b> <img src="https://img.shields.io/badge/Phase_3-100%25_Complete-brightgreen?style=flat-square" alt="Phase 3 Complete"></summary>

<br />

- **Leave Application**: Employees can apply for `Paid`, `Sick`, or `Unpaid` leave with date ranges and remarks.
- **Date Overlap Validation**: Server checks and rejects requests overlapping with existing `Pending` or `Approved` leave.
- **Admin Review Flow**: Admins can approve, reject, or revoke requests. Approving automatically generates `Leave` attendance records for weekdays in range.

</details>

<details>
<summary><b>Phase 4: Salary Management</b> <img src="https://img.shields.io/badge/Phase_4-100%25_Complete-brightgreen?style=flat-square" alt="Phase 4 Complete"></summary>

<br />

- **Employee View**: Read-only breakdown of Basic Pay, Allowances, Deductions, Net Pay, and Effective Date.
- **Admin Salary CRUD**: Admins can configure compensation structures with automatic server-side `net_pay = basic_pay + allowances - deductions` calculation.
- **Audit Trail**: Full audit logging of all CREATE, UPDATE, and DELETE actions storing actor details, timestamp, and JSON diffs.

</details>

<details>
<summary><b>Phase 5: Notifications, Analytics & Final Polish</b> <img src="https://img.shields.io/badge/Phase_5-100%25_Complete-brightgreen?style=flat-square" alt="Phase 5 Complete"></summary>

<br />

- **In-App & Email Notifications**: Automatic notifications triggered on leave applications (to Admins), leave status updates (to Employee), and document uploads (to Admins). Includes a header drawer component with unread badges and Brevo/SMTP email fallback.
- **Analytics & Reports Dashboard**: Interactive date-range filters showing organization-wide or personal KPIs for Attendance, Leave requests, and Salary compensation outlays.
- **ReportLab Salary Slip PDF**: Downloadable official PDF salary slips formatted with employee info, breakdown table, and net take-home pay.
- **CSV Data Exports**: Export Attendance and Leave data to downloadable CSV files respecting date and role filters.

</details>

---

## 🔐 Role Permission Matrix

| Feature / Action | Employee | Admin / HR |
|---|:---:|:---:|
| Sign Up & Authentication | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| View Own Profile & Documents | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Edit Own Contact Details | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Edit Salary / Designation / Role | ![Blocked](https://img.shields.io/badge/%F0%9F%99%85-Server--Blocked-rose?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Check-in / Check-out Attendance | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Admin Override Attendance | ![Blocked](https://img.shields.io/badge/%F0%9F%99%85-Denied-rose?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Submit Leave Request | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Approve / Reject / Revoke Leaves | ![Blocked](https://img.shields.io/badge/%F0%9F%99%85-Denied-rose?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| View Own Salary Breakdown | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Read--Only-blue?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| Manage Compensation & Audit Logs | ![Blocked](https://img.shields.io/badge/%F0%9F%99%85-Denied-rose?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Allowed-emerald?style=flat-square) |
| View Notifications & Mark Read | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Own-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-All-emerald?style=flat-square) |
| Export Attendance & Leave CSV | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Own-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-All--Filtered-emerald?style=flat-square) |
| Download Salary Slip PDF | ![Allowed](https://img.shields.io/badge/%E2%9C%93-Own-emerald?style=flat-square) | ![Allowed](https://img.shields.io/badge/%E2%9C%93-All-emerald?style=flat-square) |

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

<div align="center">
  <a href="#running-the-application-locally">
    <img src="https://img.shields.io/badge/%E2%9A%A1-Quick_Start-indigo?style=for-the-badge" alt="Quick Start">
  </a>
  &nbsp;&nbsp;
  <a href="#feature-summary-by-phase">
    <img src="https://img.shields.io/badge/%F0%9F%93%96-Full_Docs-blue?style=for-the-badge" alt="Full Docs">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/Hari-preetham-B/Dayflow/issues">
    <img src="https://img.shields.io/badge/%F0%9F%90%9B-Report_an_Issue-rose?style=for-the-badge" alt="Report an Issue">
  </a>
</div>

<br />

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

---

<div align="center">
  <p><font color="#4F46E5"><strong>Dayflow</strong></font> — <font color="#7C3AED">Human Resource Management System (HRMS)</font></p>
  <p><font color="#10B981">Built with ❤️ for <strong>ODOOXNMIT</strong></font></p>
  <p><a href="#top"><img src="https://img.shields.io/badge/%E2%AD%86%EF%B8%8F-Back_to_Top-4F46E5?style=for-the-badge" alt="Back to Top"></a></p>
</div>
