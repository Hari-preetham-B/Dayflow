import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { salaryApi } from '../lib/api'
import {
  DollarSign,
  Shield,
  ArrowLeft,
  Calendar,
  Lock,
  Plus,
  Edit2,
  Trash2,
  History,
  AlertCircle,
  X,
  Search,
  Building2,
  TrendingUp,
  TrendingDown,
  CreditCard,
  UserCheck
} from 'lucide-react'

export default function SalaryPage() {
  const { user, getAuthHeader } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('my')

  // Employee State
  const [mySalary, setMySalary] = useState(null)
  const [loadingMy, setLoadingMy] = useState(true)

  // Admin State
  const [employees, setEmployees] = useState([])
  const [adminSalaries, setAdminSalaries] = useState([])
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [adminSearch, setAdminSearch] = useState('')

  // UI / Notification State
  const [message, setMessage] = useState({ type: '', text: '' })
  const [actionLoading, setActionLoading] = useState(false)

  // Edit / Create Modal State
  const [editModal, setEditModal] = useState(null) // target employee object
  const [salaryForm, setSalaryForm] = useState({
    basic_pay: '',
    allowances: '',
    deductions: '',
    effective_date: new Date().toISOString().split('T')[0]
  })

  // Audit Log Modal State
  const [auditModal, setAuditModal] = useState(null) // target employee object
  const [auditLogs, setAuditLogs] = useState([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

  const fetchMySalary = useCallback(async () => {
    setLoadingMy(true)
    try {
      const data = await salaryApi.getMySalary(getAuthHeader)
      setMySalary(data.salary_structure)
    } catch (err) {
      console.error('Error fetching my salary:', err)
    } finally {
      setLoadingMy(false)
    }
  }, [getAuthHeader])

  const fetchAdminData = useCallback(async () => {
    setLoadingAdmin(true)
    try {
      const headers = await getAuthHeader()
      // Fetch users list first to show all employees even if no salary created yet
      const usersRes = await fetch(`${BACKEND_URL}/api/admin/users`, { headers })
      let usersList = []
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        usersList = usersData.users || []
      }
      setEmployees(usersList)

      // Fetch salary structures
      const salData = await salaryApi.getAdminSalaries(getAuthHeader)
      setAdminSalaries(salData.salary_structures || [])
    } catch (err) {
      console.error('Error fetching admin salary data:', err)
    } finally {
      setLoadingAdmin(false)
    }
  }, [getAuthHeader, BACKEND_URL])

  useEffect(() => {
    fetchMySalary()
    if (isAdmin) {
      fetchAdminData()
    }
  }, [isAdmin, fetchMySalary, fetchAdminData])

  // Live net pay calculation for modal form
  const computedNetPay = () => {
    const basic = parseFloat(salaryForm.basic_pay) || 0
    const allow = parseFloat(salaryForm.allowances) || 0
    const ded = parseFloat(salaryForm.deductions) || 0
    return Math.max(0, basic + allow - ded)
  }

  const openCreateOrEditModal = (emp, existingSalary = null) => {
    setEditModal({ ...emp, existingSalary })
    if (existingSalary) {
      setSalaryForm({
        basic_pay: existingSalary.basic_pay || '',
        allowances: existingSalary.allowances || '',
        deductions: existingSalary.deductions || '',
        effective_date: existingSalary.effective_date || new Date().toISOString().split('T')[0]
      })
    } else {
      setSalaryForm({
        basic_pay: '',
        allowances: '',
        deductions: '',
        effective_date: new Date().toISOString().split('T')[0]
      })
    }
  }

  const handleSaveSalary = async (e) => {
    e.preventDefault()
    if (!editModal) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const payload = {
        basic_pay: parseFloat(salaryForm.basic_pay) || 0,
        allowances: parseFloat(salaryForm.allowances) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
        effective_date: salaryForm.effective_date
      }

      const res = await salaryApi.saveSalary(getAuthHeader, editModal.id, payload)
      setMessage({ type: 'success', text: res.message })
      setEditModal(null)
      fetchAdminData()
      fetchMySalary()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSalary = async (emp) => {
    if (!confirm(`Delete salary structure for ${emp.full_name || emp.email}? This action will be logged in the audit trail.`)) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await salaryApi.deleteSalary(getAuthHeader, emp.id)
      setMessage({ type: 'success', text: res.message })
      fetchAdminData()
      fetchMySalary()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const openAuditModal = async (emp) => {
    setAuditModal(emp)
    setLoadingAudit(true)
    try {
      const res = await salaryApi.getAuditLogs(getAuthHeader, emp.id)
      setAuditLogs(res.audit_logs || [])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setAuditLogs([])
    } finally {
      setLoadingAudit(false)
    }
  }

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0.00'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  // Filter employees for admin list
  const filteredEmployees = employees.filter(emp => {
    if (!adminSearch) return true
    const q = adminSearch.toLowerCase()
    return (emp.full_name && emp.full_name.toLowerCase().includes(q)) ||
           (emp.email && emp.email.toLowerCase().includes(q)) ||
           (emp.employee_id && emp.employee_id.toLowerCase().includes(q)) ||
           (emp.department && emp.department.toLowerCase().includes(q))
  })

  // Map user ID to salary structure
  const salaryMap = {}
  adminSalaries.forEach(s => {
    salaryMap[s.user_id] = s
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
            <DollarSign className="w-8 h-8 text-emerald-400" />
            Salary & Compensation
          </h1>
        </div>

        {isAdmin && (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setActiveTab('my')} className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${activeTab === 'my' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              <CreditCard className="w-4 h-4" /> My Compensation
            </button>
            <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
              <Shield className="w-4 h-4" /> Admin Salary Management
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

        {/* EMPLOYEE VIEW TAB */}
        {activeTab === 'my' && (
          <div className="space-y-6">
            {/* Read-Only Notice Badge */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Confidential & Read-Only</h4>
                  <p className="text-xs text-slate-500">Your salary details are managed by HR/Finance. Direct modification is restricted.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Employee Self-Service
              </span>
            </div>

            {loadingMy ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                Loading salary structure...
              </div>
            ) : !mySalary ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <DollarSign className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Salary Structure Configured</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Your administrator has not set up a salary structure for your account yet. Please contact HR.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Net Pay Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">Total Take-Home Pay</span>
                      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        {formatCurrency(mySalary.net_pay)}
                        <span className="text-base font-normal text-slate-400 ml-2">/ month</span>
                      </h2>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-slate-500 block">Effective Date</span>
                        <span className="text-sm font-bold font-mono text-slate-200">{mySalary.effective_date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Basic Pay */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Pay</span>
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{formatCurrency(mySalary.basic_pay)}</div>
                    <span className="text-[11px] text-slate-500 mt-2 block">Base monthly compensation</span>
                  </div>

                  {/* Allowances */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Allowances</span>
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">+{formatCurrency(mySalary.allowances)}</div>
                    <span className="text-[11px] text-slate-500 mt-2 block">HRA, transport & special benefits</span>
                  </div>

                  {/* Deductions */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deductions</span>
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-rose-400 font-mono">-{formatCurrency(mySalary.deductions)}</div>
                    <span className="text-[11px] text-slate-500 mt-2 block">Taxes, PF & health contributions</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN SALARY MANAGEMENT TAB */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">

            {/* Controls Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search employee, ID, department..." value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Total Employees: <span className="text-white font-bold">{filteredEmployees.length}</span>
              </div>
            </div>

            {/* Admin Directory Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Employee Compensation Directory
                </h3>
              </div>

              {loadingAdmin ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading employee directory...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No matching employees found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Basic Pay</th>
                        <th className="px-4 py-3">Allowances</th>
                        <th className="px-4 py-3">Deductions</th>
                        <th className="px-4 py-3">Net Pay</th>
                        <th className="px-4 py-3">Effective Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredEmployees.map((emp) => {
                        const sal = salaryMap[emp.id]
                        return (
                          <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-200">{emp.full_name || emp.email}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{emp.employee_id} • {emp.role}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{emp.department || 'General'}</td>
                            <td className="px-4 py-3 font-mono text-slate-300">{sal ? formatCurrency(sal.basic_pay) : '--'}</td>
                            <td className="px-4 py-3 font-mono text-emerald-400">{sal ? formatCurrency(sal.allowances) : '--'}</td>
                            <td className="px-4 py-3 font-mono text-rose-400">{sal ? formatCurrency(sal.deductions) : '--'}</td>
                            <td className="px-4 py-3 font-mono font-bold text-white">{sal ? formatCurrency(sal.net_pay) : '--'}</td>
                            <td className="px-4 py-3 font-mono text-slate-400">{sal ? sal.effective_date : '--'}</td>
                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                              {sal ? (
                                <>
                                  <button onClick={() => openCreateOrEditModal(emp, sal)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all" title="Edit Salary">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteSalary(emp)} className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-all" title="Delete Salary">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => openCreateOrEditModal(emp, null)} className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg font-semibold transition-all flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Set Salary
                                </button>
                              )}
                              <button onClick={() => openAuditModal(emp)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all" title="View Audit Trail">
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </td>
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
      </div>

      {/* CREATE / EDIT SALARY MODAL */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                {editModal.existingSalary ? 'Edit Salary Structure' : 'Create Salary Structure'}
              </h3>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500">Employee:</span> <span className="font-semibold text-white">{editModal.full_name || editModal.email}</span> ({editModal.employee_id})
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Basic Pay ($)</label>
                <input type="number" step="0.01" required min="0" placeholder="e.g. 5000" value={salaryForm.basic_pay} onChange={(e) => setSalaryForm({ ...salaryForm, basic_pay: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Allowances ($)</label>
                <input type="number" step="0.01" min="0" placeholder="e.g. 1000" value={salaryForm.allowances} onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deductions ($)</label>
                <input type="number" step="0.01" min="0" placeholder="e.g. 500" value={salaryForm.deductions} onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Effective Date</label>
                <input type="date" required value={salaryForm.effective_date} onChange={(e) => setSalaryForm({ ...salaryForm, effective_date: e.target.value })} className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none" />
              </div>

              {/* Live Net Pay Calculation Preview */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-emerald-400 block">Calculated Net Pay</span>
                  <span className="text-[10px] text-slate-400">basic + allowances - deductions</span>
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {formatCurrency(computedNetPay())}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg">
                  {actionLoading ? 'Saving...' : 'Save Salary Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL MODAL */}
      {auditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Salary Audit Trail — {auditModal.full_name || auditModal.email}
              </h3>
              <button onClick={() => setAuditModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAudit ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No audit history logged for this employee yet.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {auditLogs.map((log) => {
                  let oldVal = null
                  let newVal = null
                  try { if (log.old_values) oldVal = JSON.parse(log.old_values) } catch {}
                  try { if (log.new_values) newVal = JSON.parse(log.new_values) } catch {}

                  return (
                    <div key={log.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            log.action === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            log.action === 'UPDATE' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-slate-400">By: <strong className="text-slate-200">{log.changed_by_name || 'Admin'}</strong></span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{new Date(log.changed_at).toLocaleString()}</span>
                      </div>

                      {/* Values diff */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-900 font-mono">
                        <div>
                          <span className="text-slate-500 block font-sans text-[10px]">Previous Values:</span>
                          {oldVal ? (
                            <div className="text-rose-300/80">
                              Basic: ${oldVal.basic_pay} | Allow: ${oldVal.allowances} | Ded: ${oldVal.deductions} | Net: ${oldVal.net_pay}
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">None</span>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-500 block font-sans text-[10px]">New Values:</span>
                          {newVal ? (
                            <div className="text-emerald-300/80">
                              Basic: ${newVal.basic_pay} | Allow: ${newVal.allowances} | Ded: ${newVal.deductions} | Net: ${newVal.net_pay}
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">Deleted</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
