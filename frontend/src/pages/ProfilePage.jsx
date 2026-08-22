import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../lib/api'
import { uploadFileToStorage, validateFile } from '../lib/supabaseStorage'
import { 
  User, Mail, Phone, MapPin, ShieldAlert, Briefcase, Calendar, 
  DollarSign, FileText, Upload, Trash2, Edit3, Save, X, ArrowLeft,
  CheckCircle2, Users, Building, Shield, ExternalLink, Lock
} from 'lucide-react'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser, getAuthHeader, isAdmin } = useAuth()
  const navigate = useNavigate()

  const targetId = userId || currentUser?.id
  const isSelf = currentUser?.id === targetId

  const [profile, setProfile] = useState(null)
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Edit Mode Toggle
  const [isEditing, setIsEditing] = useState(false)
  
  // Editable Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    title: '',
    department: '',
    date_of_joining: '',
    employment_type: 'Full-Time',
    reporting_manager_id: '',
    basic_salary: '$65,000 / year',
    hra: '$15,000 / year',
    allowances: '$10,000 / year',
    avatar_url: ''
  })

  // Document Upload State
  const [docFile, setDocFile] = useState(null)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState('ID Proof')
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docError, setDocError] = useState(null)

  // Avatar Uploading State
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Fetch Profile & Manager list
  useEffect(() => {
    fetchProfile()
    if (isAdmin) {
      fetchManagers()
    }
  }, [targetId, currentUser])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileApi.getProfile(getAuthHeader, targetId)
      setProfile(data.user)
      populateForm(data.user)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    try {
      const data = await profileApi.getManagers(getAuthHeader)
      setManagers(data.managers || [])
    } catch (err) {
      console.error('Failed to fetch managers list:', err)
    }
  }

  const populateForm = (u) => {
    setFormData({
      full_name: u.full_name || '',
      phone: u.phone || '',
      address: u.address || '',
      emergency_contact: u.emergency_contact || '',
      title: u.title || '',
      department: u.department || '',
      date_of_joining: u.date_of_joining || '',
      employment_type: u.employment_type || 'Full-Time',
      reporting_manager_id: u.reporting_manager_id || '',
      basic_salary: u.salary_structure?.basic_salary || '$65,000 / year',
      hra: u.salary_structure?.hra || '$15,000 / year',
      allowances: u.salary_structure?.allowances || '$10,000 / year',
      avatar_url: u.avatar_url || ''
    })
  }

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const data = await profileApi.updateProfile(getAuthHeader, targetId, formData)
      setProfile(data.user)
      populateForm(data.user)
      setIsEditing(false)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Avatar Image File Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setUploadingAvatar(true)
    setError(null)

    try {
      const { url } = await uploadFileToStorage(file, 'avatars')
      setFormData(prev => ({ ...prev, avatar_url: url }))
      
      const data = await profileApi.updateProfile(getAuthHeader, targetId, { ...formData, avatar_url: url })
      setProfile(data.user)
      setSuccessMsg('Profile picture updated!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Document Upload
  const handleUploadDocument = async (e) => {
    e.preventDefault()
    if (!docFile) {
      setDocError('Please select a file to upload.')
      return
    }

    const validation = validateFile(docFile)
    if (!validation.valid) {
      setDocError(validation.error)
      return
    }

    setUploadingDoc(true)
    setDocError(null)

    try {
      // 1. Upload to Supabase Storage
      const { url, name } = await uploadFileToStorage(docFile, 'documents')
      
      // 2. Add document record via backend API
      await profileApi.uploadDocument(getAuthHeader, targetId, {
        document_name: docName || name,
        document_type: docType,
        file_url: url,
        file_size: `${(docFile.size / (1024 * 1024)).toFixed(2)} MB`
      })

      fetchProfile()
      setDocFile(null)
      setDocName('')
      setSuccessMsg('Document uploaded successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setDocError(err.message)
    } finally {
      setUploadingDoc(false)
    }
  }

  // Delete Document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await profileApi.deleteDocument(getAuthHeader, targetId, docId)
      fetchProfile()
      setSuccessMsg('Document deleted.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium">Loading Employee Profile...</span>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-200">
        <div className="max-w-md w-full hr-glass-card p-6 rounded-2xl border border-red-500/20 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Profile Error</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="h-4 w-px bg-slate-800"></div>
            <h1 className="text-lg font-semibold text-slate-100">
              {isSelf ? 'My Employee Profile' : `Profile: ${profile?.full_name || profile?.email}`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-indigo-400" />
                {isAdmin && !isSelf ? 'Edit Employee (Admin)' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Banner Feedback */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Top Profile Summary Hero */}
        <div className="hr-glass-card p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar & Upload */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 p-0.5 shadow-xl shadow-indigo-500/10">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                      {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar Upload Overlay */}
              <label className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Identity Info */}
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-100">{profile?.full_name || profile?.email}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  profile?.role === 'admin' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {profile?.role === 'admin' ? 'Admin / HR' : 'Employee'}
                </span>
              </div>

              <p className="text-slate-400 font-medium text-sm mb-3">
                {profile?.title || 'Team Member'} &bull; <span className="text-indigo-400">{profile?.department || 'General'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> ID: {profile?.employee_id}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile?.email}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {profile?.employment_type || 'Full-Time'}
                </span>
              </div>
            </div>
          </div>

          {!isSelf && isAdmin && (
            <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Admin Management Mode</span>
            </div>
          )}
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal & Job Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Card 1: Personal Details */}
            <div className="hr-glass-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-slate-100">Personal Information</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {isEditing ? 'Editing' : 'Read-Only'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.full_name || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.phone || 'N/A'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Residential Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.address || 'N/A'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Emergency Contact Details</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      placeholder="Name (Relation) - Phone Number"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.emergency_contact || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Job Details Management */}
            <div className="hr-glass-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-semibold text-slate-100">Job Details & Organization</h3>
                </div>
                {!isAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Admin Managed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Designation / Title</label>
                  {isEditing && isAdmin ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.title || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Department</label>
                  {isEditing && isAdmin ? (
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="HR & Operations">HR & Operations</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Finance & Legal">Finance & Legal</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.department || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Date of Joining</label>
                  {isEditing && isAdmin ? (
                    <input
                      type="date"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.date_of_joining || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Employment Type</label>
                  {isEditing && isAdmin ? (
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-200">{profile?.employment_type || 'Full-Time'}</p>
                  )}
                </div>

                {/* Reporting Manager Assignment Selector (Dropdown of existing users) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Reporting Manager
                  </label>
                  {isEditing && isAdmin ? (
                    <select
                      name="reporting_manager_id"
                      value={formData.reporting_manager_id}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- No Manager Assigned --</option>
                      {managers.map(mgr => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.full_name} ({mgr.title} - {mgr.department}) &bull; {mgr.employee_id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-3">
                      {profile?.reporting_manager ? (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                              {profile.reporting_manager.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">{profile.reporting_manager.full_name}</p>
                              <p className="text-xs text-slate-400">{profile.reporting_manager.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                            {profile.reporting_manager.employee_id}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No reporting manager assigned</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: Salary Structure (Read-only for Employee) */}
            <div className="hr-glass-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-slate-100">Compensation & Salary Structure</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {isAdmin ? 'Admin Editable' : 'Read-Only Display'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Basic Pay</span>
                  {isEditing && isAdmin ? (
                    <input
                      type="text"
                      name="basic_salary"
                      value={formData.basic_salary}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100"
                    />
                  ) : (
                    <span className="text-lg font-bold text-slate-100">{profile?.salary_structure?.basic_salary || '$65,000 / year'}</span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">House Rent Allowance (HRA)</span>
                  {isEditing && isAdmin ? (
                    <input
                      type="text"
                      name="hra"
                      value={formData.hra}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100"
                    />
                  ) : (
                    <span className="text-lg font-bold text-slate-100">{profile?.salary_structure?.hra || '$15,000 / year'}</span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Special Allowances</span>
                  {isEditing && isAdmin ? (
                    <input
                      type="text"
                      name="allowances"
                      value={formData.allowances}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm text-slate-100"
                    />
                  ) : (
                    <span className="text-lg font-bold text-slate-100">{profile?.salary_structure?.allowances || '$10,000 / year'}</span>
                  )}
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Salary Component Allocation</span>
                  <span className="font-semibold text-slate-200">100% CTC</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-indigo-500 w-[60%]" title="Basic Pay 60%"></div>
                  <div className="h-full bg-teal-400 w-[25%]" title="HRA 25%"></div>
                  <div className="h-full bg-sky-400 w-[15%]" title="Allowances 15%"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Documents List & Upload (1 Col) */}
          <div className="space-y-8">
            <div className="hr-glass-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-semibold text-slate-100">Documents & Records</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {profile?.documents?.length || 0} Attached
                </span>
              </div>

              {/* Upload Document Form */}
              <form onSubmit={handleUploadDocument} className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Upload New Document</h4>
                
                {docError && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{docError}</p>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Passport, Offer Letter"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ID Proof">ID Proof</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Contract">Contract / Offer</option>
                    <option value="Resume">Resume</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">File Attachment (Max 5MB)</label>
                  <input
                    type="file"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc || !docFile}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  {uploadingDoc ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  Upload Document
                </button>
              </form>

              {/* Documents List */}
              <div className="space-y-3">
                {profile?.documents && profile.documents.length > 0 ? (
                  profile.documents.map(doc => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-200 truncate">{doc.document_name}</p>
                          <p className="text-[10px] text-slate-400">
                            {doc.document_type} &bull; {doc.file_size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition"
                          title="View / Download"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No documents uploaded yet.
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
