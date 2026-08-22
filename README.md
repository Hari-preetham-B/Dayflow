<div align="center">

  # ⚡ DAYFLOW HRMS
  ### *Enterprise Human Resource Management & Operations Platform*

  <p align="center">
    <a href="#-key-features"><img src="https://img.shields.io/badge/Platform-Enterprise_HRMS-4F46E5?style=for-the-badge&logo=rocket&logoColor=white" alt="Platform"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Frontend-React_18_--_Vite_5-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Frontend"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Backend-Python_3.13_--_Flask_3-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Backend"></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Database-Supabase_Postgres-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"></a>
  </p>

  <p align="center">
    <strong>A next-generation, full-stack HR operating system engineered for real-time shift tracking, automated payroll calculation, document management, and workforce analytics.</strong>
  </p>

  <p align="center">
    <a href="#-key-features">✨ Key Features</a> •
    <a href="#-system-architecture">🏗️ Architecture</a> •
    <a href="#-module-deep-dive">💡 Deep Dive</a> •
    <a href="#-permission-matrix">🔐 Permissions</a> •
    <a href="#-quick-start-guide">🚀 Quick Start</a> •
    <a href="#-environment-setup">⚙️ Configuration</a>
  </p>

</div>

---

## 🌟 Visual Feature Showcase

<table>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🔐 Profile & Document Management</h3>
      <ul>
        <li><b>JWT Bearer Auth</b> via Supabase with password policy validation.</li>
        <li><b>Auto-Admin Bootstrapping</b>: First registered user becomes Admin automatically.</li>
        <li><b>Server Field Whitelisting</b>: Non-admin users cannot edit designation or compensation.</li>
        <li><b>Cloud Document Locker</b>: Secure document metadata linked to Supabase Storage.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">⏱️ Attendance & Live Workstation Shift</h3>
      <ul>
        <li><b>Live Digital Clock</b> & interactive check-in/check-out timers.</li>
        <li><b>Automatic Status Tiers</b>:
          <ul>
            <li><code>Present</code>: &ge; 7.5 hrs</li>
            <li><code>Half-day</code>: &ge; 4.0 hrs & &lt; 7.5 hrs</li>
            <li><code>Absent</code>: Past weekdays without check-in</li>
            <li><code>Leave</code>: Approved leave days</li>
          </ul>
        </li>
        <li><b>Admin Override Portal</b> for status & timestamp corrections.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🏖️ Leave & Time-Off Management</h3>
      <ul>
        <li><b>Multi-Tier Leaves</b>: Paid, Sick, and Unpaid leave types.</li>
        <li><b>Date Overlap Protection</b>: Server blocks overlapping applications.</li>
        <li><b>Automated Attendance Sync</b>: Approving leave populates weekday attendance.</li>
        <li><b>Revocation Flow</b>: Reverts attendance logs cleanly upon leave revocation.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">💵 Payroll, Audit Trails & PDF Slips</h3>
      <ul>
        <li><b>Dynamic Formula</b>: <code>Net Pay = Basic + Allowances - Deductions</code>.</li>
        <li><b>Employee Read-Only Slips</b> & HR compensation management.</li>
        <li><b>Audit Trail Logging</b>: Timestamped JSON diffs for all salary changes.</li>
        <li><b>Official PDF Generation</b>: Downloadable salary slips via ReportLab.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏗️ System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / Admin
    participant React as Frontend (React + Vite)
    participant Flask as Backend API (Flask)
    participant SupabaseAuth as Supabase Auth Server
    participant Postgres as Supabase Postgres DB

    User->>React: Submit Credentials / Actions
    React->>SupabaseAuth: Authenticate & Request JWT Token
    SupabaseAuth-->>React: Return Session JWT Access Token
    React->>Flask: HTTP API Request + Bearer JWT Header
    Flask->>SupabaseAuth: Verify JWT Key & Extract User UUID
    Flask->>Postgres: Query / Mutate HR Data (SQLAlchemy ORM)
    Postgres-->>Flask: Return Query Dataset
    Flask-->>React: JSON Response Payload
    React-->>User: Render Dynamic Glassmorphic UI State
```

### 📂 Directory Map

```
Dayflow/
├── 🐍 backend/                 # Python Flask REST API Service
│   ├── app.py                 # App initialization, CORS & blueprint loader
│   ├── config.py              # Environment configuration manager
│   ├── models.py              # SQLAlchemy ORM Database Schemas
│   ├── auth_middleware.py     # JWT token verification & role enforcement middleware
│   ├── routes/                # Modular API Controllers
│   │   ├── auth_routes.py     # /api/auth (Sync & auto-admin)
│   │   ├── admin_routes.py    # /api/admin (Directory & promotions)
│   │   ├── profile_routes.py  # /api/profile (Profiles & docs)
│   │   ├── attendance_routes.py # /api/attendance (Shifts & overrides)
│   │   ├── leave_routes.py    # /api/leave (Applications & approvals)
│   │   ├── salary_routes.py   # /api/salary (Compensation & audit)
│   │   ├── notification_routes.py # /api/notifications (Alerts & mailer)
│   │   └── analytics_routes.py # /api/analytics (KPIs, PDF & CSV)
│   ├── requirements.txt
│   └── .env
│
└── ⚡ frontend/                # React 18 Single Page Application
    ├── src/
    │   ├── context/AuthContext.jsx # Supabase session & user state provider
    │   ├── lib/               # API Client, Supabase SDK & storage helpers
    │   ├── components/        # ProtectedRoute, NotificationDrawer, Spinners
    │   ├── pages/             # HR Dashboard Views (Admin, Employee, Analytics, etc.)
    │   └── index.css          # Glassmorphic HR styling system
    ├── package.json
    └── .env
```

---

## 💡 Module Deep-Dive

<details>
<summary><b>🔐 1. Authentication & Security Middleware</b></summary>
<br />

- **JWT Validation**: Every restricted endpoint passes through `@token_required` or `@admin_required` decorators, validating Supabase JWT bearer headers.
- **Server-Side Whitelisting**: Profile updates strictly enforce allowed fields for employees:
  - Allowed: `full_name`, `phone`, `address`, `emergency_contact`, `avatar_url`
  - Blocked: `role`, `department`, `title`, `basic_salary`
- **Auto-Admin Bootstrapping**: The first user registered on the platform is assigned the `admin` role automatically.
</details>

<details>
<summary><b>⏱️ 2. Attendance & Live Shift Management</b></summary>
<br />

- **Live Ticker**: Interactive workstation clock displaying local shift time and duration.
- **Automated Rules**:
  - `Present`: Working hours $\ge 7.5\text{ hrs}$
  - `Half-day`: Working hours $\ge 4.0\text{ hrs}$ and $< 7.5\text{ hrs}$
  - `Absent`: Auto-computed for past weekdays with zero check-in logs
  - `Leave`: Auto-populated on approved leave dates
- **Admin Correction Portal**: HR officers can update check-in/out timestamps and append manual audit notes.
</details>

<details>
<summary><b>🏖️ 3. Leave Request & Overlap Guard</b></summary>
<br />

- **Validation Engine**: Server checks for overlapping date ranges against `Pending` or `Approved` records before creation.
- **Automatic Attendance Generation**: Approval automatically populates weekday logs as `Leave` status.
- **Revocation Protocol**: Revoking an approved leave removes auto-generated `Leave` records, reopening the schedule for corrections.
</details>

<details>
<summary><b>💵 4. Payroll, Audit Trails & PDF Slips</b></summary>
<br />

- **Server Calculation**: `Net Pay = Basic Pay + Allowances - Deductions` calculated on the server to ensure consistency.
- **Audit Logs**: Maintains JSON diff snapshots capturing actor name, action type (`CREATE`, `UPDATE`, `DELETE`), timestamp, and value changes.
- **ReportLab PDF Generation**: Generates official PDF salary slips formatted with company branding and detailed payment items.
</details>

<details>
<summary><b>🔔 5. Notifications & Workforce Analytics</b></summary>
<br />

- **Notification Drawer**: Header drawer with unread counter badges, animated spinners, and mark-as-read options.
- **Email Dispatcher**: Integrated Brevo/SMTP mailer for background email dispatch.
- **Analytics & Exports**: Dashboard KPIs with date-range filters and streaming CSV export support.
</details>

---

## 🔐 Permission Matrix

| Operation / Feature | Employee | HR Admin |
| :--- | :---: | :---: |
| **Register & Sign In** | ✅ | ✅ |
| **View Personal Profile & Documents** | ✅ | ✅ |
| **Edit Personal Contact Information** | ✅ | ✅ |
| **Modify Role / Designation / Department** | ❌ *(Protected)* | ✅ |
| **Workstation Check-in / Check-out** | ✅ | ✅ |
| **Override Employee Shift Logs** | ❌ | ✅ |
| **Submit Leave Applications** | ✅ | ✅ |
| **Approve / Reject / Revoke Leaves** | ❌ | ✅ |
| **View Personal Salary Slip & Net Pay** | ✅ *(Read-Only)* | ✅ |
| **Configure Salary Structures & Audit Logs** | ❌ | ✅ |
| **In-App Notifications Drawer** | ✅ *(Personal)* | ✅ *(All System Alerts)* |
| **Download PDF Salary Slips** | ✅ *(Personal)* | ✅ *(All Employees)* |
| **Export Attendance & Leave CSVs** | ✅ *(Personal)* | ✅ *(Filtered Directory)* |

---

## ⚙️ Environment Setup

> [!CAUTION]
> **Credential Security**: Never commit real database credentials or secret keys to public repositories. Use placeholders in configuration files.

### 🔹 Backend Configuration (`backend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=your_random_flask_secret_key
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional SMTP Settings (Brevo)
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
BREVO_USER=your_brevo_email
BREVO_API_KEY=your_brevo_smtp_key
SENDER_EMAIL=no-reply@dayflow.com
```

### 🔹 Frontend Configuration (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 Quick Start Guide

### Step 1: Launch Backend API
```bash
# Move to backend directory
cd backend

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start Flask server
python app.py
```
> 📍 Backend runs on `http://localhost:5000`

### Step 2: Launch Frontend Application
```bash
# Open a new terminal in the frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
> 📍 Frontend runs on `http://localhost:5173`

---

## 🧪 Quality Assurance & Build Checks

```bash
# Run oxlint across frontend files
npx oxlint

# Run production Vite build
npm run build

# Validate Flask backend startup
python -c "import app"
```

---

<div align="center">
  <sub>Designed & Developed for Enterprise Excellence • Powered by Dayflow HR Engine</sub>
</div>
