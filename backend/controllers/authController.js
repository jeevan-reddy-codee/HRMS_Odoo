// Handles the logic behind /api/auth/* routes: signup, login, email verification.
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const generateLoginID = require('../utils/generateLoginID');
const { generateToken } = require('../utils/tokenUtils');
const { sendVerificationEmail } = require('../services/emailService');

// POST /api/auth/signup
// Per the wireframe notes: normal users can't self-register in the real
// product (only Admin/HR create accounts) — but we expose this endpoint
// for the very first Admin account, and for Admin-created employees below.
async function signup(req, res, next) {
  try {
    const { fullName, email, password, role = 'employee', department, jobPosition } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ') || firstName;
    const joiningYear = new Date().getFullYear();
    const serialNumber = Math.floor(1000 + Math.random() * 9000); // demo only; use a DB sequence in production
    const loginId = generateLoginID(firstName, lastName, joiningYear, serialNumber);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ loginId, email, passwordHash, role });
    const employee = await Employee.create({
      userId: user.id, fullName, department, jobPosition, dateOfJoining: new Date(),
    });

    // Fire-and-forget verification email (skipped gracefully if SMTP isn't configured).
    sendVerificationEmail(email, `${req.protocol}://${req.get('host')}/api/auth/verify/${user.id}`).catch(() => {});

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      loginId: user.login_id,
      employeeId: employee.id,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Incorrect email or password.' });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) return res.status(401).json({ message: 'Incorrect email or password.' });

    const employee = await Employee.findByUserId(user.id);
    const token = generateToken({ userId: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        employeeId: employee ? employee.id : null,
        fullName: employee ? employee.full_name : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/verify/:userId
async function verifyEmail(req, res, next) {
  try {
    await User.markVerified(req.params.userId);
    res.send('<h2>Email verified! You can close this tab and sign in.</h2>');
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (requires authMiddleware)
async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    const employee = await Employee.findByUserId(user.id);
    res.json({
      id: user.id, loginId: user.login_id, email: user.email, role: user.role, employee,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, verifyEmail, getCurrentUser };
