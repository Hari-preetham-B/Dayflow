import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  UserCheck, 
  UserX, 
  FileText, 
  Filter, 
  ArrowLeft, 
  Edit3, 
  X,
  Search,
  Building2,
  Check,
  Briefcase
} from 'lucide-react'

export default function AttendancePage() {
  const { user, supabaseUser, getAuthHeader } = useAuth()
  const isAdmin = user?.role === 'admin'

  // View mode tab: 'my' or 'admin'
  const [activeTab, setActiveTab] = useState('my')

  // Live Clock state
  const [currentTime, setCurrentTime] = useState(new Date())

  // Today's Check-in/Out state
  const [todayData, setTodayData] = useState({
    date: new Date().toISOString().split('T')[0],
    has_checked_in: false,
    has_checked_out: false,
    check_in: null,
    check_out: null,
    status: null,
    duration_hours: 0
  })

  // Employee personal attendance state
  const [myMonth, setMyMonth] = useState(new Date().getMonth() + 1)
  const [myYear, setMyYear] = useState(new Date().getFullYear())
  const [myHistory, setMyHistory] = useState([])
  const [mySummary, setMySummary] = useState({
    total_working_days: 0,
    present_days: 0,
    absent_days: 0,
    half_days: 0,
    leave_days: 0,
    attendance_rate: 0
  })

  // Admin view state
  const [adminRecords, setAdminRecords] = useState([])
  const [deptFilter, setDeptFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Admin Override Modal
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [overrideForm, setOverrideForm] = useState({
    status: 'Present',
    notes: '',
    check_in: '',
    check_out: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  // Fetch today status & personal history
  useEffect(() => {
    fetchTodayStatus()
    fetchMyAttendance()
  }, [myMonth, myYear])

  // Fetch admin records if activeTab === 'admin'
  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      fetchAdminAttendance()
    }
  }, [activeTab, deptFilter, startDate, endDate])

  const fetchTodayStatus = async () => {
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`${BACKEND_URL}/api/attendance/today`, { headers })
      if (res.ok) {
        const data = await res.json()
        setTodayData(data)
      }
    } catch (err) {
      console.error('Error fetching today status:', err)
    }
  }

  const fetchMyAttendance = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`${BACKEND_URL}/api/attendance/my?year=${myYear}&month=${myMonth}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setMyHistory(data.history || [])
        setMySummary(data.summary || {})
      }
    } catch (err) {
      console.error('Error fetching personal attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminAttendance = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      let url = `${BACKEND_URL}/api/attendance/admin?`
      if (startDate) url += `start_date=${startDate}&`
      if (endDate) url += `end_date=${endDate}&`
      if (deptFilter !== 'All') url += `department=${deptFilter}&`

      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setAdminRecords(data.attendance || [])
      }
    } catch (err) {
      console.error('Error fetching admin attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Check In
  const handleCheckIn = async () => {
    setActionLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'

      const res = await fetch(`${BACKEND_URL}/api/attendance/check-in`, {
        method: 'POST',
        headers
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed')
      }

      setMessage({ type: 'success', text: data.message })
      fetchTodayStatus()
      fetchMyAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Check Out
  const handleCheckOut = async () => {
    setActionLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'

      const res = await fetch(`${BACKEND_URL}/api/attendance/check-out`, {
        method: 'POST',
        headers
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Check-out failed')
      }

      setMessage({ type: 'success', text: data.message })
      fetchTodayStatus()
      fetchMyAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Open Admin Correction Modal
  const openOverrideModal = (record) => {
    setSelectedRecord(record)
    setOverrideForm({
      status: record.status || 'Present',
      notes: record.notes || '',
      check_in: record.check_in ? new Date(record.check_in).toISOString().slice(0, 16) : '',
      check_out: record.check_out ? new Date(record.check_out).toISOString().slice(0, 16) : ''
    })
    setIsModalOpen(true)
  }

  // Submit Admin Correction
  const handleOverrideSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'

      const endpoint = selectedRecord?.id 
        ? `${BACKEND_URL}/api/attendance/admin/${selectedRecord.id}`
        : `${BACKEND_URL}/api/attendance/admin/override`

      const payload = {
        user_id: selectedRecord?.user_id,
        date: selectedRecord?.date,
        status: overrideForm.status,
        notes: overrideForm.notes,
        check_in: overrideForm.check_in ? new Date(overrideForm.check_in).toISOString() : null,
        check_out: overrideForm.check_out ? new Date(overrideForm.check_out).toISOString() : null
      }

      const res = await fetch(endpoint, {
        method: selectedRecord?.id ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Correction failed')

      setMessage({ type: 'success', text: 'Attendance record updated successfully!' })
      setIsModalOpen(false)
      fetchAdminAttendance()
      fetchMyAttendance()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Helper formatting functions
  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  }

  const formatIsoTime = (isoString) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Present</span>
      case 'Half-day':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><Clock className="w-3 h-3"/> Half-day</span>
      case 'Absent':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><UserX className="w-3 h-3"/> Absent</span>
      case 'Leave':
        return <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><Calendar className="w-3 h-3"/> Leave</span>
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-md font-semibold text-[11px]">{status || 'Not Checked In'}</span>
    }
  }

  // Filter admin records by search
  const filteredAdminRecords = adminRecords.filter(r => {
    const matchesSearch = !searchQuery || 
      (r.user_name && r.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.employee_id && r.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-400" />
            Attendance & Shift Management
          </h1>
        </div>

        {/* Tab Switcher for Admin */}
        {isAdmin && (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${
                activeTab === 'my' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${
                activeTab === 'admin' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Admin Control Portal
            </button>
          </div>
        )}
      </div>

      {/* Alert Notification Banner */}
      {message.text && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-xl border flex items-center justify-between ${
          message.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HERO CHECK-IN / CHECK-OUT CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Live Clock Display */}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Live Workstation Clock
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-mono">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Shift Status Details */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Today's Status:</span>
                {getStatusBadge(todayData.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Check In</span>
                  <span className="font-semibold text-slate-200 font-mono">
                    {formatIsoTime(todayData.check_in)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Check Out</span>
                  <span className="font-semibold text-slate-200 font-mono">
                    {formatIsoTime(todayData.check_out)}
                  </span>
                </div>
              </div>
            </div>

            {/* Check-In / Check-Out Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || todayData.has_checked_in}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {todayData.has_checked_in ? 'Checked In Today' : 'Check In Now'}
              </button>

              <button
                onClick={handleCheckOut}
                disabled={actionLoading || !todayData.has_checked_in || todayData.has_checked_out}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {todayData.has_checked_out ? 'Checked Out Today' : 'Check Out Shift'}
              </button>
            </div>
          </div>
        </div>

        {/* MY ATTENDANCE TAB */}
        {activeTab === 'my' && (
          <div className="space-y-6">
            
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Working Days</span>
                <span className="text-2xl font-bold text-white mt-1 block">{mySummary.total_working_days || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-emerald-400 block">Present</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{mySummary.present_days || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-amber-400 block">Half-day</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">{mySummary.half_days || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-rose-400 block">Absent</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block">{mySummary.absent_days || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-sky-400 block">Leave</span>
                <span className="text-2xl font-bold text-sky-400 mt-1 block">{mySummary.leave_days || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl bg-indigo-950/20">
                <span className="text-[11px] font-semibold uppercase text-indigo-300 block">Rate %</span>
                <span className="text-2xl font-bold text-indigo-400 mt-1 block">{mySummary.attendance_rate || 0}%</span>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Shift History & Monthly Log
                </h3>

                {/* Month Picker */}
                <div className="flex items-center gap-2">
                  <select
                    value={myMonth}
                    onChange={(e) => setMyMonth(parseInt(e.target.value))}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs px-3 py-1.5 font-medium"
                  >
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map((m, idx) => (
                      <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={myYear}
                    onChange={(e) => setMyYear(parseInt(e.target.value))}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs px-3 py-1.5 font-medium"
                  >
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading attendance history...</div>
              ) : myHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No attendance logs found for this period.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Day</th>
                        <th className="px-4 py-3">Check In</th>
                        <th className="px-4 py-3">Check Out</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myHistory.map((item, idx) => {
                        const itemDate = new Date(item.date)
                        const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' })
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-200 font-mono">{item.date}</td>
                            <td className="px-4 py-3 text-slate-400 font-medium">{dayName}</td>
                            <td className="px-4 py-3 font-mono text-slate-300">{formatIsoTime(item.check_in)}</td>
                            <td className="px-4 py-3 font-mono text-slate-300">{formatIsoTime(item.check_out)}</td>
                            <td className="px-4 py-3 font-mono text-slate-400">
                              {item.duration_hours > 0 ? `${item.duration_hours} hrs` : '--'}
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                            <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{item.notes || '--'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN CONTROL PORTAL TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search employee name/ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-lg px-3 py-2"
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Date Range:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Admin Attendance Matrix Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Employee Shift Records ({filteredAdminRecords.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading admin attendance records...</div>
              ) : filteredAdminRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No attendance records found matching filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Check In</th>
                        <th className="px-4 py-3">Check Out</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredAdminRecords.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-200">{r.user_name || 'Employee'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{r.employee_id || r.user_id}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{r.department || 'General'}</td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-300">{r.date}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{formatIsoTime(r.check_in)}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{formatIsoTime(r.check_out)}</td>
                          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openOverrideModal(r)}
                              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Correct Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ADMIN STATUS CORRECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                Correct Attendance Status
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div><span className="text-slate-500">Employee:</span> <span className="font-semibold text-white">{selectedRecord?.user_name}</span></div>
                <div><span className="text-slate-500">Date:</span> <span className="font-mono text-slate-300">{selectedRecord?.date}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Shift Status
                </label>
                <select
                  value={overrideForm.status}
                  onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Check In Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    value={overrideForm.check_in}
                    onChange={(e) => setOverrideForm({ ...overrideForm, check_in: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-2.5 py-2 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Check Out Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    value={overrideForm.check_out}
                    onChange={(e) => setOverrideForm({ ...overrideForm, check_out: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-2.5 py-2 border border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Correction Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Reason for manual adjustment (e.g. System glitch, On duty)..."
                  value={overrideForm.notes}
                  onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-3 border border-slate-800 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  {actionLoading ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
