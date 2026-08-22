// Handles /api/attendance/* — check-in/out and viewing attendance history.
const Attendance = require('../models/Attendance');
const attendanceService = require('../services/attendanceService');
const { todayISO, monthRange } = require('../utils/dateUtils');

// POST /api/attendance/check-in
async function checkIn(req, res, next) {
  try {
    const { employeeId } = req.body;
    const record = await Attendance.checkIn(employeeId, todayISO());
    res.json(record);
  } catch (err) {
    next(err);
  }
}

// POST /api/attendance/check-out
async function checkOut(req, res, next) {
  try {
    const { employeeId } = req.body;
    const record = await attendanceService.completeCheckOut(employeeId, todayISO());
    res.json(record);
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/:employeeId?month=current  — employee's own attendance history
async function getEmployeeAttendance(req, res, next) {
  try {
    const { first, last } = monthRange();
    const records = await Attendance.listForEmployee(req.params.employeeId, {
      from: req.query.from || first,
      to: req.query.to || last,
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/today/all  (Admin/HR only — everyone's attendance for today)
async function getTodayAttendanceForAll(req, res, next) {
  try {
    const records = await Attendance.listForDate(req.query.date || todayISO());
    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkIn, checkOut, getEmployeeAttendance, getTodayAttendanceForAll };
