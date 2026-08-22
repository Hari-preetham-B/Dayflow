# Dayflow — Human Resource Management System (HRMS)

Dayflow is a modern, full-stack Human Resource Management System built to streamline employee operations, role-based access control, profile management, attendance tracking, and document administration.

---

## 🌟 Tech Stack

- **Backend**: Python, Flask, SQLAlchemy ORM, PostgreSQL (`psycopg2-binary`)
- **Frontend**: React 18, Vite, Tailwind CSS, `shadcn/ui` style system, Lucide Icons, React Router DOM
- **Database**: Supabase PostgreSQL (Live cloud serverless instance)
- **Authentication**: Supabase Auth (JWT bearer token validation, password strength rules, auto-admin bootstrapping)
- **Storage**: Supabase Storage (`employee-documents` bucket with local Data URL fallback)

---

## 🏗️ Architecture & Project Structure

```
Dayflow/
├── backend/
│   ├── app.py                 # Flask app factory, CORS configuration, DB startup logger
│   ├── config.py              # Configuration manager & URL-encoded database credentials
│   ├── models.py              # User & EmployeeDocument SQLAlchemy models
│   ├── auth_middleware.py     # Strict Supabase JWT token verification middleware
│   ├── routes/
│   │   ├── auth_routes.py     # Supabase sync & auto-admin bootstrap endpoint (/api/auth/sync)
│   │   ├── admin_routes.py    # Admin user listing & role promotion (/api/admin/...)
│   │   └── profile_routes.py  # Profile CRUD, role field whitelisting & document upload/delete
│   ├── requirements.txt       # Backend dependencies
│   └── .env                   # Backend environment variables
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx # Global Supabase Auth & role state manager
    │   ├── lib/
    │   │   ├── supabase.js     # Supabase JS Client initialization
    │   │   └── supabaseStorage.js # File validation & storage helper with fallback
    │   ├── pages/
    │   │   ├── SignIn.jsx           # Sign in page with specific error messages
    │   │   ├── SignUp.jsx           # Sign up page with password strength indicator
    │   │   ├── EmployeeDashboard.jsx# Employee workspace & quick-access cards
    │   │   ├── AdminDashboard.jsx   # Admin & HR control portal with employee directory
    │   │   └── ProfilePage.jsx      # Role-based profile management & document records
    │   ├── App.jsx            # Protected routes configuration
    │   └── index.css          # Tailored HR glassmorphic design system
    ├── package.json
    └── .env                   # Frontend environment variables
```

---

## 🔐 Role-Based Access Control (RBAC) & Security Features

1. **Auto-Admin Bootstrap**:
   - The very first user registering on a fresh database is automatically assigned the `admin` role.
   - All subsequent signups default to `employee`.
   - Admin status can only be granted by an existing Admin via the Admin Dashboard.
2. **Server-Side Identity Derivation**:
   - `/api/auth/sync` strictly derives identity from the verified Supabase JWT (`request.supabase_user`), preventing spoofing.
3. **Server-Side Field Whitelisting**:
   - `PUT /api/profile/<user_id>` enforces role-specific field mutation:
     - **Employees**: Can edit ONLY `full_name`, `phone`, `address`, `emergency_contact`, and `avatar_url`.
     - Attempts by employees to alter `basic_salary`, `title`, `department`, `employment_type`, or `role` are silently ignored server-side.
     - **Admins**: Granted full edit permissions across all fields and employee profiles.
4. **Document Security**:
   - `DELETE /api/profile/<user_id>/documents/<doc_id>` enforces strict ownership. Employees can ONLY delete documents tied to their own `user_id`. Attempting to delete another user's document yields `403 Forbidden`.

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)
```env
FLASK_ENV=development
SECRET_KEY=dayflow_super_secret_hrms_key_2026
DATABASE_URL=postgresql://postgres.chvbqkggxbyvplfymumr:Haripreetham%40123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://chvbqkggxbyvplfymumr.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://chvbqkggxbyvplfymumr.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 Running the Application Locally

### Step 1: Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Windows)
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask backend server
python app.py
```
*Backend will run on `http://localhost:5000` and automatically verify Supabase Postgres database connection.*

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
*Frontend will run on `http://localhost:5173`.*

---

## 🧪 Testing & Verification

- **Sign Up**: Password validation ensures length >= 6, contains a number & symbol.
- **Auto Admin**: First signed up user gets auto-promoted to Admin.
- **Profile Management**: Navigate to `/profile` to view details, switch to edit mode, upload profile pictures or documents.
- **Reporting Manager Assignment**: Admins can assign reporting managers via a dropdown list of active employees.
