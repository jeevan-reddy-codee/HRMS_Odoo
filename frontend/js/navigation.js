// Handles anything shared across every logged-in page: highlighting the
// active nav link, wiring the logout button, and the avatar dropdown.

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  highlightActiveNavLink();
  wireLogoutButtons();
  wireAvatarDropdown();
  renderUserBadge();
});

function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

function wireLogoutButtons() {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', logout);
  });
}

function wireAvatarDropdown() {
  const avatar = document.getElementById('user-avatar');
  const dropdown = document.getElementById('avatar-dropdown');
  if (!avatar || !dropdown) return;

  avatar.addEventListener('click', () => dropdown.classList.toggle('hidden'));
  document.addEventListener('click', (e) => {
    if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function renderUserBadge() {
  const user = getStoredUser();
  if (!user) return;
  const nameEls = document.querySelectorAll('[data-user="fullName"]');
  const avatarEls = document.querySelectorAll('[data-user="initials"]');
  nameEls.forEach((el) => { el.textContent = user.fullName || user.email; });
  avatarEls.forEach((el) => { el.textContent = initials(user.fullName || user.email); });
}
