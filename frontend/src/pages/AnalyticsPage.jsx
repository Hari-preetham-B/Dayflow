import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { analyticsApi } from '../lib/api'
import NotificationDrawer from '../components/NotificationDrawer'
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  Clock,
  CalendarCheck,
  DollarSign,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function AnalyticsPage() {
  const { user, getAuthHeader } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exportingAtt, setExportingAtt] = useState(false)
  const [exportingLeave, setExportingLeave] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const fetchDashboard = useCallback(async (sDate = startDate, eDate = endDate) => {
    setLoading(true)
    try {
      const res = await analyticsApi.getDashboard(getAuthHeader, sDate, eDate)
      setData(res)
    } catch (err) {
      console.error('Error fetching analytics dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeader, startDate, endDate])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleApplyFilter = (e) => {
    e.preventDefault()
    fetchDashboard(startDate, endDate)
  }

  const handleResetFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchDashboard('', '')
  }

  const handleExportAttendance = async () => {
    setExportingAtt(true)
    try {
      await analyticsApi.exportAttendanceCsv(getAuthHeader, { start_date: startDate, end_date: endDate })
    } catch (err) {
      console.error('Error exporting attendance CSV:', err)
    } finally {
      setExportingAtt(false)
    }
  }

  const handleExportLeave = async () => {
    setExportingLeave(true)
    try {
      await analyticsApi.exportLeaveCsv(getAuthHeader, { start_date: startDate, end_date: endDate })
    } catch (err) {
      console.error('Error exporting leave CSV:', err)
    } finally {
      setExportingLeave(false)
    }
  }

  const handleDownloadSalaryPdf = async () => {
    setDownloadingPdf(true)
    try {
      await analyticsApi.downloadSalaryPdf(getAuthHeader)
    } catch (err) {
      console.error('Error downloading salary PDF:', err)
    } finally {
      setDownloadingPdf(false)
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
            Analytics & Reports Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDrawer />
          <button onClick={handleDownloadSalaryPdf} disabled={downloadingPdf} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2">
            <FileText className="w-4 h-4" /> {downloadingPdf ? 'Generating PDF...' : 'Download Salary Slip'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Date Filter & Export Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <form onSubmit={handleApplyFilter} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">From:</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-slate-200 focus:outline-none font-mono" />
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">To:</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-slate-200 focus:outline-none font-mono" />
            </div>

            <button type="submit" className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">
              <Filter className="w-3.5 h-3.5" /> Apply Filter
            </button>

            {(startDate || endDate) && (
              <button type="button" onClick={handleResetFilter} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all">
                Reset
              </button>
            )}
          </form>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
            <button onClick={handleExportAttendance} disabled={exportingAtt} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" /> {exportingAtt ? 'Exporting...' : 'Export Attendance CSV'}
            </button>
            <button onClick={handleExportLeave} disabled={exportingLeave} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" /> {exportingLeave ? 'Exporting...' : 'Export Leave CSV'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            Loading analytics dashboard...
          </div>
        ) : !data ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            Unable to load analytics data.
          </div>
        ) : (
          <div className="space-y-8">

            {/* SECTION 1: ATTENDANCE ANALYTICS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" /> Attendance Overview
                </h2>
                <span className="text-xs text-slate-500">
                  {isAdmin ? 'Organization-wide Attendance' : 'Personal Attendance History'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Attendance Rate */}
                <div className="bg-gradient-to-br from-slate-900 to-teal-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">Attendance Rate</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{data.attendance.attendance_percentage}%</div>
                  <span className="text-[11px] text-slate-500 mt-2 block">{data.attendance.total_records} total logged shifts</span>
                </div>

                {/* Present */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Present</span>
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><UserCheck className="w-4 h-4" /></div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">{data.attendance.present}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Full shifts completed</span>
                </div>

                {/* Half Day */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Half-Day</span>
                    <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Clock className="w-4 h-4" /></div>
                  </div>
                  <div className="text-2xl font-bold text-amber-400 font-mono">{data.attendance.half_day}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Partial shifts</span>
                </div>

                {/* Absent */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Absent</span>
                    <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><XCircle className="w-4 h-4" /></div>
                  </div>
                  <div className="text-2xl font-bold text-rose-400 font-mono">{data.attendance.absent}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Unexcused / missed</span>
                </div>

                {/* Leave */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On Leave</span>
                    <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg"><Calendar className="w-4 h-4" /></div>
                  </div>
                  <div className="text-2xl font-bold text-sky-400 font-mono">{data.attendance.leave}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Approved leave days</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: LEAVE MANAGEMENT ANALYTICS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-sky-400" /> Leave Summary & Breakdown
                </h2>
                <span className="text-xs text-slate-500">Total Requests: {data.leave.total_requests}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Cards */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Request Statuses</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Pending</span>
                      <span className="font-bold font-mono text-white text-base">{data.leave.pending}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approved</span>
                      <span className="font-bold font-mono text-white text-base">{data.leave.approved}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-rose-400 font-semibold flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejected</span>
                      <span className="font-bold font-mono text-white text-base">{data.leave.rejected}</span>
                    </div>
                  </div>
                </div>

                {/* Leave Type Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Breakdown by Leave Type</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-xs font-semibold text-emerald-400 uppercase">Paid Leave</span>
                      <div className="text-3xl font-extrabold text-white font-mono">{data.leave.type_breakdown.Paid}</div>
                      <span className="text-[10px] text-slate-500">Annual / Casual</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-xs font-semibold text-rose-400 uppercase">Sick Leave</span>
                      <div className="text-3xl font-extrabold text-white font-mono">{data.leave.type_breakdown.Sick}</div>
                      <span className="text-[10px] text-slate-500">Medical / Health</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-xs font-semibold text-amber-400 uppercase">Unpaid Leave</span>
                      <div className="text-3xl font-extrabold text-white font-mono">{data.leave.type_breakdown.Unpaid}</div>
                      <span className="text-[10px] text-slate-500">Loss of pay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: SALARY & COMPENSATION ANALYTICS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Salary & Payroll Financials
                </h2>
                <span className="text-xs text-slate-500">
                  {isAdmin ? `Total Structures: ${data.salary.total_count}` : 'Personal Compensation Totals'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Basic Pay */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Basic Pay</span>
                  <div className="text-2xl font-bold text-white font-mono">{formatCurrency(data.salary.total_basic_pay)}</div>
                  <span className="text-[11px] text-slate-500 mt-2 block">Base monthly outlay</span>
                </div>

                {/* Allowances */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Allowances</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">+{formatCurrency(data.salary.total_allowances)}</div>
                  <span className="text-[11px] text-slate-500 mt-2 block">HRA & special benefits</span>
                </div>

                {/* Deductions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Deductions</span>
                  <div className="text-2xl font-bold text-rose-400 font-mono">-{formatCurrency(data.salary.total_deductions)}</div>
                  <span className="text-[11px] text-slate-500 mt-2 block">Taxes & PF contributions</span>
                </div>

                {/* Net Pay */}
                <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Total Net Payroll</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{formatCurrency(data.salary.total_net_pay)}</div>
                  <span className="text-[11px] text-slate-400 mt-2 block">Total take-home disbursement</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
