import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import NotificationDrawer from '../components/NotificationDrawer'
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Clock, 
  CalendarCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Search, 
  Sparkles,
  RefreshCw,
  Award,
  DollarSign,
  BarChart3,
  User
} from 'lucide-react'

export default function AdminDashboard() {
  const { userProfile, promoteUserToAdmin, session } = useAuth()
  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [promotingId, setPromotingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState('employees') // 'employees' | 'attendance' | 'leaves'

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  const fetchUsers = async () => {
    if (!session?.access_token) return
    setLoadingUsers(true)
    setErrorMsg('')
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load employee list from backend API.')
      }
      const data = await response.json()
      setUsersList(data.users || [])
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Error connecting to Admin API.')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [session])

  const handlePromote = async (userToPromote) => {
    setPromotingId(userToPromote.id)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      await promoteUserToAdmin(userToPromote.id)
      setSuccessMsg(`Successfully promoted ${userToPromote.email} to Admin/HR Officer!`)
      // Refresh list
      await fetchUsers()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to promote user.')
    } finally {
      setPromotingId(null)
    }
  }

  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const adminCount = usersList.filter(u => u.role === 'admin').length
  const employeeCount = usersList.filter(u => u.role === 'employee').length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Dayflow</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                Admin & HR Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/attendance"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/30"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline">Attendance Portal</span>
            </Link>

            <Link
              to="/leave"
              className="px-3.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-sky-500/30"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden md:inline">Leave Approvals</span>
            </Link>

            <Link
              to="/salary"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden md:inline">Salary</span>
            </Link>

            <Link
              to="/analytics"
              className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-500/30"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>

            <NotificationDrawer />

            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden lg:inline">Back to Employee Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin Overview Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="hr-glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Registered</div>
              <div className="text-2xl font-black text-white mt-1">{usersList.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active Employees & HR</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <div className="hr-glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">HR Officers / Admins</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{adminCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Elevated System Privileges</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div className="hr-glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Present Today</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">18 / 20</div>
              <div className="text-[11px] text-slate-400 mt-0.5">90% Attendance Today</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="hr-glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Leave Approvals</div>
              <div className="text-2xl font-black text-sky-400 mt-1">2 Pending</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Requires Action</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-sky-400" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'employees' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employee & Role Management</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'attendance' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance Records</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'leaves' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Leave Approvals Queue</span>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Tab 1: Employee & Role Management */}
        {activeTab === 'employees' && (
          <div className="hr-glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Employee Directory</h2>
                <p className="text-xs text-slate-400">View employees and manage Admin/HR Officer role promotions</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, email..."
                    className="bg-slate-900/90 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={fetchUsers}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Refresh users"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 uppercase text-[11px] font-semibold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Employee ID</th>
                    <th className="px-4 py-3.5">Work Email</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Title</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        Loading registered employees...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        No employee records found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-4 font-mono font-semibold text-indigo-300">
                          {u.employee_id}
                        </td>
                        <td className="px-4 py-4 font-medium text-white">
                          {u.email}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {u.department || 'Engineering'}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {u.title || 'Software Engineer'}
                        </td>
                        <td className="px-4 py-4">
                          {u.role === 'admin' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1 w-max text-[11px]">
                              <Award className="w-3 h-3" />
                              Admin / HR
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium w-max text-[11px]">
                              Employee
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                          <Link
                            to={`/profile/${u.id}`}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] border border-slate-700 transition-all inline-flex items-center gap-1"
                          >
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Profile</span>
                          </Link>

                          {u.role === 'admin' ? (
                            <span className="text-slate-500 italic text-[11px] ml-1">Admin</span>
                          ) : (
                            <button
                              onClick={() => handlePromote(u)}
                              disabled={promotingId === u.id}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-[11px] shadow-sm transition-all inline-flex items-center gap-1"
                            >
                              {promotingId === u.id ? (
                                <span>Promoting...</span>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Promote</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Overview */}
        {activeTab === 'attendance' && (
          <div className="hr-glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white">Organization Attendance Records</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="text-xs uppercase font-medium">On-Time Check In Rate</div>
                <div className="text-2xl font-black mt-1">94.5%</div>
              </div>
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300">
                <div className="text-xs uppercase font-medium">Remote Work Today</div>
                <div className="text-2xl font-black mt-1">4 Employees</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <div className="text-xs uppercase font-medium">Pending Time Edits</div>
                <div className="text-2xl font-black mt-1">1 Request</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 uppercase text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Shift Date</th>
                    <th className="px-4 py-3">Clock In</th>
                    <th className="px-4 py-3">Clock Out</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {[
                    { name: 'Sarah Jenkins (EMP-1002)', date: 'Aug 22, 2026', in: '08:58 AM', out: '05:30 PM', status: 'Present' },
                    { name: 'Alex Rivera (EMP-1004)', date: 'Aug 22, 2026', in: '09:05 AM', out: '05:30 PM', status: 'Present (Late 5m)' },
                    { name: 'David Kim (EMP-1009)', date: 'Aug 22, 2026', in: '-', out: '-', status: 'On Paid Leave' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3.5 font-medium text-white">{row.name}</td>
                      <td className="px-4 py-3.5 text-slate-300">{row.date}</td>
                      <td className="px-4 py-3.5 font-mono">{row.in}</td>
                      <td className="px-4 py-3.5 font-mono">{row.out}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Leave Approvals Queue */}
        {activeTab === 'leaves' && (
          <div className="hr-glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white">Pending Leave Approval Requests</h2>

            <div className="space-y-4">
              {[
                { name: 'David Kim', empId: 'EMP-1009', type: 'Annual Vacation', dates: 'Sep 10 - Sep 14 (5 days)', reason: 'Family trip planned in advance' },
                { name: 'Maria Santos', empId: 'EMP-1015', type: 'Casual Leave', dates: 'Aug 28 (1 day)', reason: 'Personal errands and medical appointment' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="font-mono text-xs text-indigo-400">({item.empId})</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[11px] font-semibold">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">Dates: <span className="font-semibold text-white">{item.dates}</span></div>
                    <div className="text-xs text-slate-400 mt-0.5">Reason: "{item.reason}"</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
