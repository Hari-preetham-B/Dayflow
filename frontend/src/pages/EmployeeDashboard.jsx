import NotificationDrawer from '../components/NotificationDrawer'
import { 
  User, 
  Clock, 
  Calendar, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  BadgeCheck, 
  Sparkles,
  ChevronRight,
  DollarSign,
  BarChart3,
  X
} from 'lucide-react'

export default function EmployeeDashboard() {
  const { userProfile, signOut, isAdmin } = useAuth()
  const [activeModal, setActiveModal] = useState(null) // 'profile' | 'attendance' | 'leave'

  const employeeName = userProfile?.email ? userProfile.email.split('@')[0] : 'Employee'
  const displayEmail = userProfile?.email || 'user@company.com'
  const empId = userProfile?.employee_id || 'EMP-1042'
  const department = userProfile?.department || 'Engineering'
  const title = userProfile?.title || 'Software Engineer'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Dayflow</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                Employee Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/analytics"
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="View Analytics & Reports"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">Switch to HR Admin View</span>
              </Link>
            )}

            <NotificationDrawer />

            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400">
                {employeeName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white capitalize">{employeeName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{empId}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl hr-glass-card p-6 md:p-8 border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shift Active • Checked in at 09:00 AM</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome back, <span className="capitalize text-indigo-400">{employeeName}</span>!
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Here is your daily activity overview, attendance log, and leave management portal.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Department</span>
                <span className="text-sm font-semibold text-white">{department}</span>
              </div>
              <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block font-medium">Role Status</span>
                <span className="text-sm font-semibold text-indigo-400 capitalize">{userProfile?.role || 'Employee'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span>Quick Access Portals</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Profile Card */}
            <Link 
              to="/profile"
              className="hr-glass-card hr-glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">My Profile</h3>
                <p className="text-xs text-slate-400 mb-4">View & edit personal details, job role, and attached documents.</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Title:</span>
                  <span className="font-semibold text-slate-200">{title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="font-mono text-indigo-300">{empId}</span>
                </div>
              </div>
            </Link>

            {/* 2. Attendance Card */}
            <Link 
              to="/attendance"
              className="hr-glass-card hr-glass-card-hover rounded-2xl p-6 cursor-pointer border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-teal-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Attendance Log</h3>
                <p className="text-xs text-slate-400 mb-4">Check-in, track daily shifts, and view monthly attendance logs.</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Shift Actions:</span>
                  <span className="font-semibold text-emerald-400">Check In / Out Portal</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Attendance Status:</span>
                  <span className="font-mono text-teal-300">Live Tracker</span>
                </div>
              </div>
            </Link>

            {/* 3. Leave Requests Card */}
            <Link 
              to="/leave"
              className="hr-glass-card hr-glass-card-hover rounded-2xl p-6 cursor-pointer border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-sky-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Leave Requests</h3>
                <p className="text-xs text-slate-400 mb-4">Apply for time off, track approvals, and manage leave history.</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Actions:</span>
                  <span className="font-semibold text-sky-400">Apply & Track Leave</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-amber-400">View Pending Requests</span>
                </div>
              </div>
            </Link>

            {/* 4. Salary & Compensation Card */}
            <Link 
              to="/salary"
              className="hr-glass-card hr-glass-card-hover rounded-2xl p-6 cursor-pointer border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Salary & Compensation</h3>
                <p className="text-xs text-slate-400 mb-4">View your basic pay, allowances, deductions, and monthly net pay.</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Access Mode:</span>
                  <span className="font-semibold text-emerald-400">Read-Only View</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Structure:</span>
                  <span className="font-mono text-emerald-300">Basic + Allow - Ded</span>
                </div>
              </div>
            </Link>

            {/* 4. Logout Card */}
            <div 
              onClick={signOut}
              className="hr-glass-card hr-glass-card-hover rounded-2xl p-6 cursor-pointer border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LogOut className="w-6 h-6 text-rose-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-rose-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Workspace Sign Out</h3>
                <p className="text-xs text-slate-400 mb-4">Safely sign out of your current session on this device.</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <span>Click to Logout</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Stats Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Metrics */}
          <div className="hr-glass-card rounded-2xl p-6 border border-slate-800 lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Recent Shift History</span>
              <span className="text-xs font-normal text-slate-400">August 2026</span>
            </h3>
            
            <div className="space-y-3">
              {[
                { date: 'Today, Aug 22', checkIn: '09:01 AM', checkOut: '05:30 PM (Scheduled)', status: 'On Duty', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                { date: 'Yesterday, Aug 21', checkIn: '08:55 AM', checkOut: '05:32 PM', status: 'Completed (8h 37m)', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                { date: 'Wednesday, Aug 20', checkIn: '09:04 AM', checkOut: '05:28 PM', status: 'Completed (8h 24m)', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                { date: 'Tuesday, Aug 19', checkIn: '08:58 AM', checkOut: '05:35 PM', status: 'Completed (8h 37m)', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
              ].map((shift, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{shift.date}</div>
                    <div className="text-slate-400 mt-0.5">In: {shift.checkIn} • Out: {shift.checkOut}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${shift.badge}`}>
                    {shift.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time off summary */}
          <div className="hr-glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-4">Leave Balances</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Paid Casual Leave</span>
                    <span className="text-slate-400">12 / 15 days left</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-indigo-500 h-2 rounded-full w-[80%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Sick Leave</span>
                    <span className="text-slate-400">8 / 10 days left</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-teal-500 h-2 rounded-full w-[80%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Earned Annual Leave</span>
                    <span className="text-slate-400">18 / 20 days left</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div className="bg-sky-500 h-2 rounded-full w-[90%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
              Need extra days? You can apply directly through the Leave Request portal card above.
            </div>
          </div>
        </div>

      </main>

      {/* Interactive Feature Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg hr-glass-card rounded-2xl p-6 border border-slate-800 relative shadow-2xl">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'profile' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Employee Profile Details</h3>
                    <p className="text-xs text-slate-400">Verified System Identity</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Full Email:</span>
                    <span className="font-semibold text-white">{displayEmail}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Employee ID:</span>
                    <span className="font-mono text-indigo-300">{empId}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-200">{department}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Job Title:</span>
                    <span className="font-medium text-slate-200">{title}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-semibold text-indigo-400 capitalize">{userProfile?.role || 'Employee'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'attendance' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Attendance Detail Log</h3>
                    <p className="text-xs text-slate-400">August 2026 Shift Breakdown</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-base">Today's Shift Active</div>
                      <div className="text-xs opacity-80">Clocked in at 09:01 AM</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs">
                      Present
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Total Work Days This Month:</span>
                    <span className="font-bold text-white">20 Days</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Present Days:</span>
                    <span className="font-bold text-emerald-400">18 Days</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Late Arrivals:</span>
                    <span className="font-bold text-amber-400">1 Day</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'leave' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Leave Requests & Portal</h3>
                    <p className="text-xs text-slate-400">Time Off Applications</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Annual Vacation Request (3 days)</div>
                      <div className="text-xs opacity-80">Sep 10 - Sep 12 • Pending HR Review</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                      Pending
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">Casual Leave (1 day)</div>
                      <div className="text-xs text-slate-400">Aug 05 • Approved by HR</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
