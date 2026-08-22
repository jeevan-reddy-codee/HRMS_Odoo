// Powers profile.html — profile view/edit with tabs (Basic, Resume, Private, Salary).

document.addEventListener('DOMContentLoaded', () => {
  const user = getStoredUser();
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const employeeId = params.get('id') || user.employeeId;
  const isOwnProfile = employeeId === user.employeeId;
  const isAdmin = ['admin', 'hr_officer'].includes(user.role);

  loadProfile(employeeId, isOwnProfile, isAdmin);
  wireTabs();

  const editForm = document.getElementById('edit-profile-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => handleSaveProfile(e, employeeId, isAdmin));
  }
});

function wireTabs() {
  document.querySelectorAll('.profile-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.profile-tab-panel').forEach((p) => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target)?.classList.remove('hidden');
    });
  });
}

async function loadProfile(employeeId, isOwnProfile, isAdmin) {
  try {
    const emp = await api.getEmployee(employeeId);

    document.getElementById('profile-name').textContent = emp.full_name;
    document.getElementById('profile-position').textContent = emp.job_position || '—';
    document.getElementById('profile-email').textContent = emp.email || '—';
    document.getElementById('profile-mobile').textContent = emp.phone || '—';
    document.getElementById('profile-login-id').textContent = emp.login_id || '—';
    document.getElementById('profile-company').textContent = emp.company_name || '—';
    document.getElementById('profile-department').textContent = emp.department || '—';
    document.getElementById('profile-location').textContent = emp.location || '—';
    document.getElementById('profile-avatar').textContent = initials(emp.full_name);

    document.getElementById('profile-about').textContent = emp.about || 'No bio added yet.';
    document.getElementById('profile-skills').textContent = (emp.skills || []).join(', ') || '—';

    // Private info — only visible to owner or admin (also enforced server-side).
    if (emp.bankDetails) {
      document.getElementById('profile-account-number').textContent = emp.bankDetails.account_number || '—';
      document.getElementById('profile-bank-name').textContent = emp.bankDetails.bank_name || '—';
      document.getElementById('profile-ifsc').textContent = emp.bankDetails.ifsc_code || '—';
      document.getElementById('profile-pan').textContent = emp.bankDetails.pan_no || '—';
    }

    // Salary tab only visible to admin, per the wireframe note.
    const salaryTab = document.getElementById('tab-salary-trigger');
    if (salaryTab) salaryTab.classList.toggle('hidden', !isAdmin);

    // Editable fields: employees can edit phone/address; admins can edit everything.
    const editButton = document.getElementById('edit-profile-btn');
    if (editButton) editButton.classList.toggle('hidden', !(isOwnProfile || isAdmin));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSaveProfile(e, employeeId, isAdmin) {
  e.preventDefault();
  const phone = document.getElementById('input-phone').value;
  const address = document.getElementById('input-address').value;

  try {
    if (isAdmin) {
      await api.adminUpdateProfile(employeeId, { phone, address });
    } else {
      await api.updateOwnProfile(employeeId, { phone, address });
    }
    showToast('Profile updated.', 'success');
    document.getElementById('edit-profile-modal')?.classList.add('hidden');
    loadProfile(employeeId, true, isAdmin);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditProfileModal() {
  document.getElementById('edit-profile-modal')?.classList.remove('hidden');
}
function closeEditProfileModal() {
  document.getElementById('edit-profile-modal')?.classList.add('hidden');
}
