import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Mail, Lock, IdCard, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

export default function SignUp() {
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Password strength checks
  const isMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  const isPasswordValid = isMinLength && hasNumber && hasSymbol

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!employeeId.trim()) {
      setError('Please provide a valid Employee ID.')
      return
    }

    if (!isPasswordValid) {
      setError('Password does not meet the strength criteria.')
      return
    }

    setLoading(true)
    try {
      const data = await signUp({
        email: email.trim(),
        password,
        employeeId: employeeId.trim()
      })

      if (data?.session) {
        navigate('/dashboard')
      } else {
        setSuccessMsg('Account created successfully! If email verification is enabled on your Supabase project, please check your inbox to confirm your email before signing in.')
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md hr-glass-card rounded-2xl p-8 shadow-2xl border border-slate-800">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Join Dayflow HRMS</h1>
          <p className="text-sm text-slate-400 mt-1">Create your employee workspace account</p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee ID */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Employee ID
            </label>
            <div className="relative">
              <IdCard className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-1042"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Password Validation Inline Feedback */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
              <p className="font-medium text-slate-400 mb-1">Password Requirements:</p>
              <div className={`flex items-center gap-2 ${isMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                <span>At least 8 characters long</span>
              </div>
              <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                <span>Contains at least 1 number (0-9)</span>
              </div>
              <div className={`flex items-center gap-2 ${hasSymbol ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasSymbol ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                <span>Contains at least 1 special symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  )
}
