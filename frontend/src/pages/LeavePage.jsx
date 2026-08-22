import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  X,
  FileText,
  Filter,
  Search,
  Building2,
  RotateCcw,
  Trash2,
  MessageSquare
} from 'lucide-react'

export default function LeavePage() {
  const { user, getAuthHeader } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('my')

  // Apply form state
  const [formData, setFormData] = useState({
    leave_type: 'Paid',
    start_date: '',
    end_date: '',
    remarks: ''
  })

  // Leave history
  const [myLeaves, setMyLeaves] = useState([])
  const [mySummary, setMySummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')

  // Admin state
  const [adminLeaves, setAdminLeaves] = useState([])
  const [adminStatusFilter, setAdminStatusFilter] = useState('Pending')
  const [adminSearch, setAdminSearch] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Admin review modal
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewAction, setReviewAction] = useState('Approved')
  const [adminComment, setAdminComment] = useState('')

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchMyLeaves()
  }, [statusFilter])

  useEffect(() => {
    if (activeTab === 'admin' && isAdmin) {
      fetchAdminLeaves()
    }
  }, [activeTab, adminStatusFilter])

  const fetchMyLeaves = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      let url = `${BACKEND_URL}/api/leave/my`
      if (statusFilter) url += `?status=${statusFilter}`
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setMyLeaves(data.leave_requests || [])
        setMySummary(data.summary || {})
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminLeaves = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      let url = `${BACKEND_URL}/api/leave/admin`
      if (adminStatusFilter) url += `?status=${adminStatusFilter}`
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setAdminLeaves(data.leave_requests || [])
      }
    } catch (err) {
      console.error('Error fetching admin leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  // Submit leave application
  const handleApply = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'

      const res = await fetch(`${BACKEND_URL}/api/leave/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to submit leave request')

      setMessage({ type: 'success', text: data.message })
      setFormData({ leave_type: 'Paid', start_date: '', end_date: '', remarks: '' })
      fetchMyLeaves()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel pending request
  const handleCancel = async (leaveId) => {
    if (!confirm('Cancel this pending leave request?')) return
    setActionLoading(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`${BACKEND_URL}/api/leave/${leaveId}/cancel`, {
        method: 'DELETE',
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cancel failed')
      setMessage({ type: 'success', text: data.message })
      fetchMyLeaves()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  // Admin review submit
  const handleReviewSubmit = async () => {
    if (!reviewModal) return
    setActionLoading(true)
    try {
      const headers = await getAuthHeader()
      headers['Content-Type'] = 'application/json'

      const res = await fetch(`${BACKEND_URL}/api/leave/admin/${reviewModal.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: reviewAction,
          admin_comment: adminComment
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Review failed')

      setMessage({ type: 'success', text: data.message })
      setReviewModal(null)
      setAdminComment('')
      fetchAdminLeaves()
      fetchMyLeaves()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
      case 'Approved':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
      case 'Revoked':
        return <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 border border-slate-600 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Revoked</span>
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-md text-[11px]">{status}</span>
    }
  }

  const getTypeBadge = (type) => {
    const colors = {
      'Paid': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      'Sick': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'Unpaid': 'text-slate-400 bg-slate-700/50 border-slate-600'
    }
    return <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors[type] || colors['Unpaid']}`}>{type}</span>
  }

  // Filter admin records by search
  const filteredAdminLeaves = adminLeaves.filter(r => {
    if (!adminSearch) return true
    const q = adminSearch.toLowerCase()
    return (r.user_name && r.user_name.toLowerCase().includes(q)) ||
           (r.employee_id && r.employee_id.toLowerCase().includes(q))
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-sky-400" />
            Leave & Time-Off Management
          </h1>
        </div>

        {isAdmin && (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setActiveTab('my')} className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${activeTab === 'my' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              <FileText className="w-4 h-4" /> My Leaves
            </button>
            <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              <Building2 className="w-4 h-4" /> Admin Approvals
            </button>
          </div>
        )}
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-xl border flex items-center justify-between ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">

        {/* MY LEAVES TAB */}
        {activeTab === 'my' && (
          <div className="space-y-8">

            {/* Apply for Leave Form */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                Apply for Leave
              </h2>

              <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Leave Type</label>
                  <select value={formData.leave_type} onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-sky-500 focus:outline-none">
                    <option value="Paid">Paid Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
                  <input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-sky-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
                  <input type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-sky-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Remarks</label>
                  <input type="text" placeholder="Reason for leave..." value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-sky-500 focus:outline-none" />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button type="submit" disabled={actionLoading} className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {actionLoading ? 'Submitting...' : 'Submit Leave Request'}
                  </button>
                </div>
              </form>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Total Requests</span>
                <span className="text-2xl font-bold text-white mt-1 block">{mySummary.total || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-amber-400 block">Pending</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">{mySummary.pending || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-emerald-400 block">Approved</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{mySummary.approved || 0}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] font-semibold uppercase text-rose-400 block">Rejected</span>
                <span className="text-2xl font-bold text-rose-400 mt-1 block">{mySummary.rejected || 0}</span>
              </div>
            </div>

            {/* Leave History Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" /> Leave Request History
                </h3>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs px-3 py-1.5 font-medium">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading leave history...</div>
              ) : myLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No leave requests found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Start</th>
                        <th className="px-4 py-3">End</th>
                        <th className="px-4 py-3">Remarks</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Admin Comment</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myLeaves.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">{getTypeBadge(r.leave_type)}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{r.start_date}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{r.end_date}</td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{r.remarks || '--'}</td>
                          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                          <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{r.admin_comment || '--'}</td>
                          <td className="px-4 py-3 text-right">
                            {r.status === 'Pending' && (
                              <button onClick={() => handleCancel(r.id)} disabled={actionLoading} className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> Cancel
                              </button>
                            )}
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

        {/* ADMIN APPROVALS TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search employee name/ID..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-800 focus:border-sky-500 focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select value={adminStatusFilter} onChange={(e) => setAdminStatusFilter(e.target.value)} className="bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-lg px-3 py-2">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>
            </div>

            {/* Admin Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" /> Leave Requests Queue ({filteredAdminLeaves.length})
                </h3>
              </div>

              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading leave requests...</div>
              ) : filteredAdminLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No leave requests found matching filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Start</th>
                        <th className="px-4 py-3">End</th>
                        <th className="px-4 py-3">Remarks</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredAdminLeaves.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-200">{r.user_name || 'Employee'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{r.employee_id}</div>
                          </td>
                          <td className="px-4 py-3">{getTypeBadge(r.leave_type)}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{r.start_date}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{r.end_date}</td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{r.remarks || '--'}</td>
                          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            {r.status === 'Pending' && (
                              <>
                                <button onClick={() => { setReviewModal(r); setReviewAction('Approved'); setAdminComment('') }} className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </button>
                                <button onClick={() => { setReviewModal(r); setReviewAction('Rejected'); setAdminComment('') }} className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                            {r.status === 'Approved' && (
                              <button onClick={() => { setReviewModal(r); setReviewAction('Revoked'); setAdminComment('') }} className="px-2.5 py-1 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Revoke
                              </button>
                            )}
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

      {/* Admin Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                {reviewAction === 'Approved' ? 'Approve' : reviewAction === 'Rejected' ? 'Reject' : 'Revoke'} Leave Request
              </h3>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div><span className="text-slate-500">Employee:</span> <span className="font-semibold text-white">{reviewModal.user_name}</span></div>
              <div><span className="text-slate-500">Type:</span> {getTypeBadge(reviewModal.leave_type)}</div>
              <div><span className="text-slate-500">Period:</span> <span className="font-mono text-slate-300">{reviewModal.start_date} → {reviewModal.end_date}</span></div>
              <div><span className="text-slate-500">Remarks:</span> <span className="text-slate-300">{reviewModal.remarks || 'No remarks'}</span></div>
            </div>

            {reviewAction === 'Approved' && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300">
                <strong>Note:</strong> Approving this request will automatically create "Leave" attendance records for all weekdays in this date range, overriding any existing Present/Absent/Half-day records.
              </div>
            )}

            {reviewAction === 'Revoked' && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                <strong>Note:</strong> Revoking this approved request will remove all auto-created "Leave" attendance records for this date range. A new corrected request can then be submitted.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Admin Comment</label>
              <textarea rows="3" placeholder="Add a note for the employee..." value={adminComment} onChange={(e) => setAdminComment(e.target.value)} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-3 border border-slate-800 focus:border-sky-500 focus:outline-none"></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setReviewModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={handleReviewSubmit} disabled={actionLoading} className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg disabled:opacity-50 ${
                reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                reviewAction === 'Rejected' ? 'bg-rose-600 hover:bg-rose-500 text-white' :
                'bg-slate-600 hover:bg-slate-500 text-white'
              }`}>
                {actionLoading ? 'Processing...' : reviewAction === 'Approved' ? 'Approve Request' : reviewAction === 'Rejected' ? 'Reject Request' : 'Revoke Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
