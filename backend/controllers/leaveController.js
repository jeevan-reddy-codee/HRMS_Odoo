// Handles /api/leave/* — applying for leave and approving/rejecting requests.
const LeaveRequest = require('../models/LeaveRequest');
const { sendLeaveStatusEmail } = require('../services/emailService');
const User = require('../models/User');
const Employee = require('../models/Employee');

const LEAVE_BALANCES = { paid: 24, sick: 7 }; // annual allowance per the wireframe ("24 Days Available" etc.)

// POST /api/leave  — employee applies for leave
async function applyForLeave(req, res, next) {
  try {
    const { employeeId, leaveType, startDate, endDate, remarks, attachmentUrl } = req.body;
    const request = await LeaveRequest.create({ employeeId, leaveType, startDate, endDate, remarks, attachmentUrl });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave/:employeeId  — employee's own leave history + remaining balance
async function getEmployeeLeave(req, res, next) {
  try {
    const { employeeId } = req.params;
    const requests = await LeaveRequest.listForEmployee(employeeId);

    const paidUsed = await LeaveRequest.approvedDaysUsedThisYear(employeeId, 'paid');
    const sickUsed = await LeaveRequest.approvedDaysUsedThisYear(employeeId, 'sick');

    res.json({
      requests,
      balances: {
        paid: Math.max(0, LEAVE_BALANCES.paid - paidUsed),
        sick: Math.max(0, LEAVE_BALANCES.sick - sickUsed),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/leave  (Admin/HR only — all requests, optionally filtered by ?status=pending)
async function listAllLeave(req, res, next) {
  try {
    const requests = await LeaveRequest.listAll(req.query.status);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

// PUT /api/leave/:id/status  (Admin/HR only — approve or reject)
async function updateLeaveStatus(req, res, next) {
  try {
    const { status, comment } = req.body; // status: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const approverEmployee = await Employee.findByUserId(req.user.userId);
    const updated = await LeaveRequest.updateStatus(req.params.id, status, approverEmployee?.id, comment);

    // Notify the employee (best-effort, doesn't block the response).
    const requesterEmployee = await Employee.findById(updated.employee_id);
    if (requesterEmployee?.email) {
      sendLeaveStatusEmail(requesterEmployee.email, status, updated.leave_type, updated.start_date, updated.end_date).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { applyForLeave, getEmployeeLeave, listAllLeave, updateLeaveStatus };
