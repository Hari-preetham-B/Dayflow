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

  // Handle binary downloads (e.g. PDF, CSV)
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/pdf') || contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new Error(`File download failed with status ${response.status}`)
    }
    return response.blob()
  }

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

// ============================================================
// NOTIFICATION API HELPERS
// ============================================================

export const notificationsApi = {
  getMyNotifications: (getAuthHeader) => 
    request('/api/notifications/my', { method: 'GET' }, getAuthHeader),

  markRead: (getAuthHeader, notificationId) => 
    request(`/api/notifications/${notificationId}/read`, { method: 'PUT' }, getAuthHeader),

  markAllRead: (getAuthHeader) => 
    request('/api/notifications/read-all', { method: 'PUT' }, getAuthHeader)
}

// ============================================================
// ANALYTICS & EXPORT HELPERS
// ============================================================

export const analyticsApi = {
  getDashboard: (getAuthHeader, startDate = '', endDate = '') => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''
    return request(`/api/analytics/dashboard${query}`, { method: 'GET' }, getAuthHeader)
  },

  exportAttendanceCsv: async (getAuthHeader, filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const query = params ? `?${params}` : ''
    const blob = await request(`/api/analytics/export/attendance${query}`, { method: 'GET' }, getAuthHeader)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance_report.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },

  exportLeaveCsv: async (getAuthHeader, filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const query = params ? `?${params}` : ''
    const blob = await request(`/api/analytics/export/leave${query}`, { method: 'GET' }, getAuthHeader)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leave_report.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },

  downloadSalaryPdf: async (getAuthHeader, userId = '') => {
    const endpoint = userId ? `/api/salary/slip/${userId}` : '/api/salary/slip/my'
    const blob = await request(endpoint, { method: 'GET' }, getAuthHeader)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SalarySlip_${userId || 'My'}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }
}
