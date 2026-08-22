import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync profile with backend REST API strictly using Supabase Bearer JWT token
  const syncBackendUser = async (jwtToken, customEmployeeId = null) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          employee_id: customEmployeeId
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error("Backend sync failed:", errData.error || response.statusText)
        return null
      }

      const data = await response.json()
      setUserProfile(data.user)
      return data.user
    } catch (err) {
      console.error("Error communicating with Dayflow backend API:", err)
      return null
    }
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        syncBackendUser(session.access_token)
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        await syncBackendUser(session.access_token)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up flow
  const signUp = async ({ email, password, employeeId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          employee_id: employeeId
        }
      }
    })

    if (error) throw error

    if (data?.session?.access_token) {
      await syncBackendUser(data.session.access_token, employeeId)
    }

    return data
  }

  // Sign in flow with granular error parsing
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      let friendlyMessage = error.message
      if (error.message.includes("Email not confirmed")) {
        friendlyMessage = "Your email address has not been verified yet. Please check your inbox for the confirmation email."
      } else if (error.message.includes("Invalid login credentials")) {
        friendlyMessage = "Incorrect email or password. Please verify your login credentials."
      } else if (error.message.includes("User not found")) {
        friendlyMessage = "No registered Dayflow account was found with this email address."
      }
      throw new Error(friendlyMessage)
    }

    if (data?.session?.access_token) {
      await syncBackendUser(data.session.access_token)
    }

    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
  }

  const promoteUserToAdmin = async (userId) => {
    if (!session?.access_token) return false
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to promote user")
      }
      return await response.json()
    } catch (e) {
      throw e
    }
  }

  const getAuthHeader = async () => {
    const currentSession = session || (await supabase.auth.getSession()).data.session
    if (currentSession?.access_token) {
      return { Authorization: `Bearer ${currentSession.access_token}` }
    }
    return {}
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    role: userProfile?.role || 'employee',
    isAdmin: userProfile?.role === 'admin',
    signUp,
    signIn,
    signOut,
    syncBackendUser,
    promoteUserToAdmin,
    getAuthHeader,
    getAuthHeaders: getAuthHeader
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
