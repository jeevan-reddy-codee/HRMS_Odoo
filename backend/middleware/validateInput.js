// Simple, dependency-free validators for the main forms in the app.
// Each returns a middleware; on failure it responds with 400 and stops the chain.

function validateSignup(req, res, next) {
  const { email, password, fullName } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length < 2) errors.push('Full name is required.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('A valid email is required.');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
  if (password && !/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.');
  if (password && !/[0-9]/.test(password)) errors.push('Password must contain a number.');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  next();
}

function validateLeaveRequest(req, res, next) {
  const { leaveType, startDate, endDate } = req.body;
  const errors = [];

  if (!['paid', 'sick', 'unpaid'].includes(leaveType)) errors.push('Invalid leave type.');
  if (!startDate || !endDate) errors.push('Start and end dates are required.');
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.push('Start date must be before end date.');
  }

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

module.exports = { validateSignup, validateLogin, validateLeaveRequest };
