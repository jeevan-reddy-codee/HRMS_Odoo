// Handles the Sign In and Sign Up forms (index.html and signup.html).

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
});

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('form-error');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  errorBox.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    const data = await api.login({ email, password });
    localStorage.setItem('dayflow_token', data.token);
    localStorage.setItem('dayflow_user', JSON.stringify(data.user));

    const isAdmin = ['admin', 'hr_officer'].includes(data.user.role);
    window.location.href = isAdmin ? 'dashboard-admin.html' : 'dashboard-employee.html';
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const fullName = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const errorBox = document.getElementById('form-error');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  errorBox.textContent = '';

  if (password !== confirmPassword) {
    errorBox.textContent = 'Passwords do not match.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    await api.signup({ fullName, email, password, role: 'employee' });
    showToast('Account created — check your email to verify, then sign in.', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
}
