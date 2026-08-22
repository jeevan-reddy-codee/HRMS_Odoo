// Powers both dashboard-admin.html and dashboard-employee.html.
// Detects which page it's on via a data attribute on <body>.

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'dashboard-admin') loadAdminDashboard();
  if (page === 'dashboard-employee') loadEmployeeDashboard();
});

async function loadAdminDashboard() {
  try {
    const data = await api.getAdminDashboard();

    document.getElementById('stat-total-employees').textContent = data.totalEmployees;
    document.getElementById('stat-present-today').textContent = data.presentToday;
    document.getElementById('stat-pending-leave').textContent = data.pendingLeaveCount;

    renderEmployeeCards(data.employees);
    renderPendingLeaveList(data.pendingLeave);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderEmployeeCards(employees) {
  const container = document.getElementById('employee-card-grid');
  if (!container) return;

  container.innerHTML = employees.map((emp) => `
    <div class="card employee-card hoverable" onclick="window.location.href='profile.html?id=${emp.id}'">
      <div class="employee-card__avatar">${initials(emp.full_name)}</div>
      <div>
        <strong>${emp.full_name}</strong>
        <div class="text-muted" style="font-size:0.82rem;">${emp.job_position || emp.department || ''}</div>
      </div>
      <span class="employee-card__status status-dot ${emp.todayStatus === 'present' ? 'present' : emp.todayStatus === 'leave' ? 'leave' : 'absent'}"
            title="${emp.todayStatus}"></span>
    </div>
  `).join('');
}

function renderPendingLeaveList(requests) {
  const container = document.getElementById('pending-leave-list');
  if (!container) return;

  if (!requests.length) {
    container.innerHTML = '<p class="text-muted">No pending requests right now.</p>';
    return;
  }

  container.innerHTML = requests.map((r) => `
    <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border);">
      <div>
        <strong>${r.full_name}</strong>
        <div class="text-muted" style="font-size:0.82rem;">${r.leave_type} • ${formatDate(r.start_date)} → ${formatDate(r.end_date)}</div>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-success" onclick="approveLeave('${r.id}')">Approve</button>
        <button class="btn btn-danger" onclick="rejectLeave('${r.id}')">Reject</button>
      </div>
    </div>
  `).join('');
}

async function approveLeave(id) {
  try {
    await api.updateLeaveStatus(id, { status: 'approved' });
    showToast('Leave approved', 'success');
    loadAdminDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function rejectLeave(id) {
  try {
    await api.updateLeaveStatus(id, { status: 'rejected' });
    showToast('Leave rejected', 'success');
    loadAdminDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadEmployeeDashboard() {
  const user = getStoredUser();
  if (!user?.employeeId) return;

  try {
    const data = await api.getEmployeeDashboard(user.employeeId);
    const status = data.todayAttendance.status;

    const statusBadge = document.getElementById('today-status-badge');
    if (statusBadge) statusBadge.textContent = status;

    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    if (checkInBtn && checkOutBtn) {
      const hasCheckedIn = status === 'present' && data.todayAttendance.check_in_time;
      const hasCheckedOut = !!data.todayAttendance.check_out_time;
      checkInBtn.classList.toggle('hidden', hasCheckedIn);
      checkOutBtn.classList.toggle('hidden', !hasCheckedIn || hasCheckedOut);
    }

    renderRecentLeave(data.recentLeaveRequests);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRecentLeave(requests) {
  const container = document.getElementById('recent-leave-list');
  if (!container) return;

  if (!requests.length) {
    container.innerHTML = '<p class="text-muted">No leave requests yet.</p>';
    return;
  }

  container.innerHTML = requests.map((r) => `
    <div class="flex-between" style="padding:10px 0;border-bottom:1px solid var(--border);">
      <span>${r.leave_type} • ${formatDate(r.start_date)} → ${formatDate(r.end_date)}</span>
      <span class="pill pill-${r.status}">${r.status}</span>
    </div>
  `).join('');
}
