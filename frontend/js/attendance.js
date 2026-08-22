// Powers attendance.html — check-in/check-out buttons and the attendance table.

document.addEventListener('DOMContentLoaded', () => {
  const user = getStoredUser();
  if (!user) return;

  wireCheckInOut(user);

  const isAdmin = ['admin', 'hr_officer'].includes(user.role);
  if (isAdmin) {
    loadAllAttendanceToday();
  } else {
    loadOwnAttendance(user.employeeId);
  }
});

function wireCheckInOut(user) {
  const checkInBtn = document.getElementById('check-in-btn');
  const checkOutBtn = document.getElementById('check-out-btn');

  if (checkInBtn) {
    checkInBtn.addEventListener('click', async () => {
      try {
        await api.checkIn(user.employeeId);
        showToast('Checked in — have a great day!', 'success');
        checkInBtn.classList.add('hidden');
        if (checkOutBtn) checkOutBtn.classList.remove('hidden');
        loadOwnAttendance(user.employeeId);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', async () => {
      try {
        await api.checkOut(user.employeeId);
        showToast('Checked out — see you tomorrow.', 'success');
        checkOutBtn.classList.add('hidden');
        loadOwnAttendance(user.employeeId);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

async function loadOwnAttendance(employeeId) {
  const tableBody = document.getElementById('attendance-table-body');
  if (!tableBody || !employeeId) return;

  try {
    const records = await api.getEmployeeAttendance(employeeId);
    tableBody.innerHTML = records.map((r) => `
      <tr>
        <td>${formatDate(r.date)}</td>
        <td class="mono">${formatTime(r.check_in_time)}</td>
        <td class="mono">${formatTime(r.check_out_time)}</td>
        <td class="mono">${r.work_hours ?? '—'}</td>
        <td class="mono">${r.extra_hours ?? '—'}</td>
        <td><span class="status-dot ${r.status === 'present' ? 'present' : r.status === 'leave' ? 'leave' : 'absent'}"></span> ${r.status}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-muted">No attendance records for this month yet.</td></tr>';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAllAttendanceToday() {
  const tableBody = document.getElementById('attendance-table-body');
  if (!tableBody) return;

  try {
    const records = await api.getTodayAttendanceForAll();
    tableBody.innerHTML = records.map((r) => `
      <tr>
        <td>${r.full_name}</td>
        <td class="mono">${formatTime(r.check_in_time)}</td>
        <td class="mono">${formatTime(r.check_out_time)}</td>
        <td class="mono">${r.work_hours ?? '—'}</td>
        <td><span class="status-dot ${r.status === 'present' ? 'present' : 'absent'}"></span> ${r.status}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-muted">No one has checked in yet today.</td></tr>';
  } catch (err) {
    showToast(err.message, 'error');
  }
}
