// Powers leave.html — applying for leave (employees) and approving/
// rejecting requests (admin/HR).

document.addEventListener('DOMContentLoaded', () => {
  const user = getStoredUser();
  if (!user) return;

  const isAdmin = ['admin', 'hr_officer'].includes(user.role);
  const applyForm = document.getElementById('apply-leave-form');

  if (applyForm) applyForm.addEventListener('submit', (e) => handleApplyLeave(e, user.employeeId));

  if (isAdmin) {
    loadAllLeaveRequests();
  } else {
    loadOwnLeave(user.employeeId);
  }
});

async function handleApplyLeave(e, employeeId) {
  e.preventDefault();
  const leaveType = document.getElementById('leave-type').value;
  const startDate = document.getElementById('leave-start').value;
  const endDate = document.getElementById('leave-end').value;
  const remarks = document.getElementById('leave-remarks').value;
  const errorBox = document.getElementById('leave-form-error');
  errorBox.textContent = '';

  try {
    await api.applyForLeave({ employeeId, leaveType, startDate, endDate, remarks });
    showToast('Leave request submitted.', 'success');
    e.target.reset();
    document.getElementById('new-leave-modal')?.classList.add('hidden');
    loadOwnLeave(employeeId);
  } catch (err) {
    errorBox.textContent = err.message;
  }
}

async function loadOwnLeave(employeeId) {
  if (!employeeId) return;
  try {
    const { requests, balances } = await api.getEmployeeLeave(employeeId);

    const paidBalanceEl = document.getElementById('paid-balance');
    const sickBalanceEl = document.getElementById('sick-balance');
    if (paidBalanceEl) paidBalanceEl.textContent = `${balances.paid} Days Available`;
    if (sickBalanceEl) sickBalanceEl.textContent = `${balances.sick} Days Available`;

    const tableBody = document.getElementById('leave-table-body');
    if (tableBody) {
      tableBody.innerHTML = requests.map((r) => `
        <tr>
          <td>${r.leave_type}</td>
          <td>${formatDate(r.start_date)}</td>
          <td>${formatDate(r.end_date)}</td>
          <td><span class="pill pill-${r.status}">${r.status}</span></td>
        </tr>
      `).join('') || '<tr><td colspan="4" class="text-muted">No leave requests yet.</td></tr>';
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAllLeaveRequests() {
  try {
    const requests = await api.listAllLeave();
    const tableBody = document.getElementById('leave-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = requests.map((r) => `
      <tr>
        <td>${r.full_name}</td>
        <td>${r.leave_type}</td>
        <td>${formatDate(r.start_date)}</td>
        <td>${formatDate(r.end_date)}</td>
        <td><span class="pill pill-${r.status}">${r.status}</span></td>
        <td>
          ${r.status === 'pending' ? `
            <button class="btn btn-success" onclick="reviewLeave('${r.id}','approved')">Approve</button>
            <button class="btn btn-danger" onclick="reviewLeave('${r.id}','rejected')">Reject</button>
          ` : '—'}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-muted">No leave requests found.</td></tr>';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function reviewLeave(id, status) {
  try {
    await api.updateLeaveStatus(id, { status });
    showToast(`Leave ${status}.`, 'success');
    loadAllLeaveRequests();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openNewLeaveModal() {
  document.getElementById('new-leave-modal')?.classList.remove('hidden');
}
function closeNewLeaveModal() {
  document.getElementById('new-leave-modal')?.classList.add('hidden');
}
