// Shared API Helper for Dayflow HRMS

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

/**
 * Helper to execute fetch requests with automatic JSON parsing and error handling
 */
async function request(endpoint, options = {}, getAuthHeader = null) {
  let headers = options.headers || {}
  
  if (getAuthHeader) {
    const authHeaders = await getAuthHeader()
    headers = { ...headers, ...authHeaders }
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error || data.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// ============================================================
// SALARY API HELPERS
// ============================================================

export const salaryApi = {
  // Employee: get own salary structure (read-only)
  getMySalary: (getAuthHeader) => request('/api/salary/my', { method: 'GET' }, getAuthHeader),

  // Admin: get all employee salaries or filtered by user_id
  getAdminSalaries: (getAuthHeader, userId = '') => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    return request(`/api/salary/admin${query}`, { method: 'GET' }, getAuthHeader)
  },

  // Admin: get employee salary & audit trail
  getEmployeeSalary: (getAuthHeader, userId) => 
    request(`/api/salary/admin/${userId}`, { method: 'GET' }, getAuthHeader),

  // Admin: create or update salary structure
  saveSalary: (getAuthHeader, userId, payload) => 
    request(`/api/salary/admin/${userId}`, { method: 'POST', body: payload }, getAuthHeader),

  // Admin: delete salary structure
  deleteSalary: (getAuthHeader, userId) => 
    request(`/api/salary/admin/${userId}`, { method: 'DELETE' }, getAuthHeader),

  // Admin: get audit log history
  getAuditLogs: (getAuthHeader, userId = '') => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    return request(`/api/salary/admin/audit${query}`, { method: 'GET' }, getAuthHeader)
  }
}
