// Central place for every call to the backend. Every other JS file
// imports `api` instead of writing its own fetch() calls, so the base
// URL and auth header only need to be handled in one spot.

const API_BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('dayflow_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || (data.errors && data.errors.join(', ')) || 'Something went wrong.';
    throw new Error(message);
  }
  return data;
}

const api = {
  // Auth
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  getCurrentUser: () => request('/auth/me'),

  // Employees
  listEmployees: () => request('/employees'),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (payload) => request('/employees', { method: 'POST', body: payload }),
  updateOwnProfile: (id, payload) => request(`/employees/${id}`, { method: 'PUT', body: payload }),
  adminUpdateProfile: (id, payload) => request(`/employees/${id}/admin`, { method: 'PUT', body: payload }),

  // Attendance
  checkIn: (employeeId) => request('/attendance/check-in', { method: 'POST', body: { employeeId } }),
  checkOut: (employeeId) => request('/attendance/check-out', { method: 'POST', body: { employeeId } }),
  getEmployeeAttendance: (employeeId, params = '') => request(`/attendance/${employeeId}${params}`),
  getTodayAttendanceForAll: () => request('/attendance/today/all'),

  // Leave
  applyForLeave: (payload) => request('/leave', { method: 'POST', body: payload }),
  getEmployeeLeave: (employeeId) => request(`/leave/${employeeId}`),
  listAllLeave: (status = '') => request(`/leave${status ? `?status=${status}` : ''}`),
  updateLeaveStatus: (id, payload) => request(`/leave/${id}/status`, { method: 'PUT', body: payload }),

  // Payroll
  getSalary: (employeeId) => request(`/payroll/${employeeId}`),
  updateSalary: (employeeId, payload) => request(`/payroll/${employeeId}`, { method: 'PUT', body: payload }),

  // Dashboard
  getAdminDashboard: () => request('/dashboard/admin'),
  getEmployeeDashboard: (employeeId) => request(`/dashboard/employee/${employeeId}`),
};
