// Handles /api/employees/* — viewing and editing profile data.
const Employee = require('../models/Employee');
const BankDetails = require('../models/BankDetails');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateLoginID = require('../utils/generateLoginID');

// GET /api/employees  (Admin/HR only — the employee list on the dashboard)
async function listEmployees(req, res, next) {
  try {
    const employees = await Employee.listAll();
    res.json(employees);
  } catch (err) {
    next(err);
  }
}

// GET /api/employees/:id
async function getEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });

    // Bank/private info is only attached for the owner or an admin.
    const isOwner = req.user.role === 'employee' && employee.user_id === req.user.userId;
    const isAdmin = ['admin', 'hr_officer'].includes(req.user.role);
    let bankDetails = null;
    if (isOwner || isAdmin) {
      bankDetails = await BankDetails.findByEmployeeId(employee.id);
    }

    res.json({ ...employee, bankDetails });
  } catch (err) {
    next(err);
  }
}

// PUT /api/employees/:id  — employees can only edit limited fields
async function updateOwnProfile(req, res, next) {
  try {
    const { phone, address, profilePictureUrl } = req.body;
    const updated = await Employee.updateLimited(req.params.id, { phone, address, profilePictureUrl });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// PUT /api/employees/:id/admin  — Admin/HR can edit every field
async function adminUpdateProfile(req, res, next) {
  try {
    const updated = await Employee.updateFull(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// POST /api/employees  — Admin/HR creates a brand-new employee (per wireframe note:
// normal users can't self-register; only Admin/HR can create accounts)
async function createEmployee(req, res, next) {
  try {
    const { fullName, email, department, jobPosition, managerId, role = 'employee' } = req.body;

    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ') || firstName;
    const joiningYear = new Date().getFullYear();
    const serialNumber = Math.floor(1000 + Math.random() * 9000);
    const loginId = generateLoginID(firstName, lastName, joiningYear, serialNumber);

    // System-generated temporary password, as noted in the wireframes.
    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({ loginId, email, passwordHash, role });
    const employee = await Employee.create({
      userId: user.id, fullName, department, jobPosition, dateOfJoining: new Date(), managerId,
    });

    res.status(201).json({
      employee, loginId, temporaryPassword: tempPassword,
      note: 'Share this temporary password securely — the employee should change it after first login.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEmployees, getEmployee, updateOwnProfile, adminUpdateProfile, createEmployee };
