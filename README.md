<div align="center">

  # ⚡ Dayflow HRMS
  ### Enterprise-Grade Human Resource Management System

  [![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Python](https://img.shields.io/badge/Backend-Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
  [![Flask](https://img.shields.io/badge/Framework-Flask_3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
  [![Supabase](https://img.shields.io/badge/Database-Supabase_Postgres-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <strong>Streamlining workforce operations with real-time attendance tracking, automated payroll computation, role-based access control, and intuitive analytics.</strong>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-role-permission-matrix">Permissions</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-environment-configuration">Configuration</a>
  </p>

</div>

---

## 🌟 Overview

**Dayflow** is an all-in-one, modern HR management platform tailored for growing enterprises and fast-paced teams. Built with a responsive **React 18 + Tailwind CSS** glassmorphic interface and powered by a robust **Flask + Supabase PostgreSQL** backend, Dayflow replaces clunky legacy HR software with a seamless, high-performance experience.

> [!TIP]
> **Live Auto-Admin Bootstrap**: The very first user registering on a fresh Dayflow instance automatically receives **Admin / HR Officer** privileges, granting instant access to employee management, attendance overrides, and payroll setup.

---

## ✨ Key Features

| Feature Module | Capabilities & Highlights |
| :--- | :--- |
| 🔐 **Authentication & Security** | Supabase Auth with JWT bearer validation, password strength indicators, and server-side field whitelisting. |
| 👤 **Profile & Documents** | Comprehensive employee records, document uploads linked to Supabase Storage, emergency contacts, and designation tracking. |
| ⏱️ **Attendance & Shifts** | Real-time workstation check-in/out, live shift ticker, auto-status derivation (`Present`, `Half-day`, `Absent`, `Leave`), and admin correction tools. |
| 🏖️ **Leave & Time-Off** | Apply for Paid/Sick/Unpaid leave, automatic date-overlap guard, approval workflow, and weekday attendance auto-population. |
| 💵 **Salary & Compensation** | Dynamic net-pay calculator (`basic + allowances - deductions`), read-only employee slips, audit logging, and ReportLab PDF downloads. |
| 🔔 **Notifications & Alerts** | Real-time header drawer with unread counters, automated event triggers, and Brevo/SMTP email fallback. |
| 📊 **Workforce Analytics** | Executive dashboard KPIs, attendance breakdown charts, date-range filters, and streaming CSV data exports. |

---

## 🏗️ Architecture

```
Dayflow/
├── 🐍 backend/
│   ├── app.py                 # Flask app factory, CORS & blueprint registration
│   ├── config.py              # Configuration & database connections
│   ├── models.py              # SQLAlchemy ORM Data Models
│   ├── auth_middleware.py     # Supabase JWT token verification & role enforcement
│   ├── routes/                # Modular REST API Endpoint Blueprints
│   │   ├── auth_routes.py     # Profile synchronization & auto-admin bootstrap
│   │   ├── admin_routes.py    # Admin directory & role promotion
│   │   ├── profile_routes.py  # Profile CRUD & document metadata
│   │   ├── attendance_routes.py # Check-in/out & shift overrides
│   │   ├── leave_routes.py    # Applications & approval workflows
│   │   ├── salary_routes.py   # Compensation CRUD & audit trails
│   │   ├── notification_routes.py # In-app alerts & SMTP mailer
│   │   └── analytics_routes.py # Dashboard KPIs, CSV exports & PDF generation
│   ├── requirements.txt
│   └── .env
│
└── ⚡ frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx # Global Supabase session & role context
    │   ├── lib/
    │   │   ├── api.js          # Unified API service layer
    │   │   └── supabase.js     # Supabase client initialization
    │   ├── components/         # Protected routes, drawers, spinners
    │   ├── pages/              # Responsive HR dashboards & module views
    │   └── index.css          # Tailored HR glassmorphic design system
    ├── package.json
    └── .env
```

---

## 💡 Module Deep-Dive

<details>
<summary>🔍 <strong>1. Profile & Employee Document Management</strong></summary>

<br />

- **Role-Based Security**: Non-admin users are restricted to editing basic contact information (`full_name`, `phone`, `address`, `emergency_contact`, `avatar_url`). Sensitive fields (`title`, `department`, `role`, `basic_salary`) are strictly protected by server-side whitelisting.
- **Document Locker**: Upload and view official employee documents (IDs, offer letters, contracts) backed by Supabase Storage with user-level isolation.
</details>

<details>
<summary>⏱️ <strong>2. Automated Shift & Attendance Tracking</strong></summary>

<br />

- **Live Shift Ticker**: Displays a real-time digital clock and workstation shift duration.
- **Shift Thresholds**:
  - `Present`: Working hours $\ge 7.5\text{ hours}$
  - `Half-day`: Working hours $\ge 4.0\text{ hours}$ and $< 7.5\text{ hours}$
  - `Absent`: Past weekdays without check-in activity
  - `Leave`: Approved time-off days auto-marked
- **Admin Correction Portal**: HR administrators can manually override check-in timestamps, status codes, and attach audit notes for edge cases.
</details>

<details>
<summary>🏖️ <strong>3. Leave Management & Approval Workflows</strong></summary>

<br />

- **Smart Overlap Prevention**: The API validates application dates to prevent double-booking against existing `Pending` or `Approved` requests.
- **Automated Sync**: Approving a leave application automatically populates weekday attendance logs for the entire date range with `Leave` status.
- **Revocation Safety**: Admins can revoke approved leaves to revert auto-generated attendance logs.
</details>

<details>
<summary>💵 <strong>4. Payroll, Audit Logs & PDF Generation</strong></summary>

<br />

- **Dynamic Net Pay**: Server-calculated formula: `Net Pay = Basic Pay + Allowances - Deductions`.
- **Complete Audit Trail**: Every salary update, addition, or deletion creates a timestamped JSON diff log containing the actor details and previous vs. new values.
- **Official PDF Slips**: Generate printable salary slips powered by ReportLab with custom styling and take-home pay breakdowns.
</details>

<details>
<summary>🔔 <strong>5. In-App Notifications & Email Alerts</strong></summary>

<br />

- **Header Notification Drawer**: Interactive dropdown with unread badge counter, animated loading states, and "Mark All as Read" capabilities.
- **Brevo/SMTP Integration**: Automatic background email alerts for critical events (leave applications submitted, leave status decided, documents uploaded).
</details>

---

## 🔐 Role Permission Matrix

| Feature / Action | Employee | Admin / HR Officer |
| :--- | :---: | :---: |
| **Sign Up & Account Creation** | ✅ | ✅ |
| **View Personal Profile & Docs** | ✅ | ✅ |
| **Edit Personal Contact Details** | ✅ | ✅ |
| **Edit Designation / Role / Department** | ❌ *(Blocked)* | ✅ |
| **Workstation Check-in / Check-out** | ✅ | ✅ |
| **Override Employee Shift Logs** | ❌ | ✅ |
| **Apply for Leave** | ✅ | ✅ |
| **Approve / Reject / Revoke Leaves** | ❌ | ✅ |
| **View Own Compensation Breakdown** | ✅ *(Read-Only)* | ✅ |
| **Manage Employee Salaries & View Audits** | ❌ | ✅ |
| **View System Notifications** | ✅ *(Personal)* | ✅ *(All & Admin Alerts)* |
| **Export CSV Reports** | ✅ *(Personal)* | ✅ *(Filtered Directory)* |
| **Download PDF Salary Slip** | ✅ *(Personal)* | ✅ *(All Employees)* |

---

## ⚙️ Environment Configuration

> [!CAUTION]
> **Keep credentials secure!** Never commit production secrets or actual connection strings to public repositories. Use placeholders in template files.

### 1. Backend Configuration (`backend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=your_custom_flask_secret_key
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional Brevo/SMTP Mailer
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
BREVO_USER=your_brevo_email
BREVO_API_KEY=your_brevo_smtp_key
SENDER_EMAIL=no-reply@dayflow.com
```

### 2. Frontend Configuration (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch Flask backend
python app.py
```
> Backend starts on `http://localhost:5000`

### 2. Start Frontend App
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install packages
npm install

# Run Vite dev server
npm run dev
```
> Frontend starts on `http://localhost:5173`

---

## 🧪 Build & Quality Verification

- **Lint Check**:
  ```bash
  npx oxlint
  ```
- **Frontend Production Build**:
  ```bash
  npm run build
  ```
- **Backend Import Verification**:
  ```bash
  python -c "import app"
  ```

---

<div align="center">
  <sub>Built with ❤️ for Modern HR Teams by Dayflow System Engineers</sub>
</div>
