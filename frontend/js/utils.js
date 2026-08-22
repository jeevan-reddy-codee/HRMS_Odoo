// Small, dependency-free helpers reused across pages.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function initials(fullName = '') {
  return fullName.trim().split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('');
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast card';
  toast.style.cssText = `padding:12px 18px;border-left:4px solid ${type === 'error' ? '#E15A5A' : type === 'success' ? '#3FAE68' : '#33418B'};min-width:220px;`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function getStoredUser() {
  const raw = localStorage.getItem('dayflow_user');
  return raw ? JSON.parse(raw) : null;
}

function requireAuth() {
  const token = localStorage.getItem('dayflow_token');
  if (!token) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('dayflow_token');
  localStorage.removeItem('dayflow_user');
  window.location.href = 'index.html';
}
