// Business logic that sits between the Attendance model and the controller —
// mainly turning raw attendance rows into the numbers payroll needs.
const Attendance = require('../models/Attendance');
const { hoursBetween } = require('../utils/dateUtils');

/** Completes a check-out: works out hours worked and any extra hours past 8. */
async function completeCheckOut(employeeId, date) {
  const record = await Attendance.findByEmployeeAndDate(employeeId, date);
  if (!record || !record.check_in_time) {
    throw new Error('No check-in found for today — please check in first.');
  }
  const now = new Date();
  const workedHours = hoursBetween(record.check_in_time, now);
  const standardDay = 8;
  const extraHours = Math.max(0, workedHours - standardDay);

  return Attendance.checkOut(employeeId, date, Math.min(workedHours, standardDay), extraHours);
}

/** Builds { present, absent, halfDay, leave } counts for a date range — used by payroll. */
async function getMonthSummary(employeeId, from, to) {
  const rows = await Attendance.summaryForPayroll(employeeId, from, to);
  const summary = { present: 0, absent: 0, 'half-day': 0, leave: 0 };
  rows.forEach((r) => { summary[r.status] = r.count; });
  return summary;
}

module.exports = { completeCheckOut, getMonthSummary };
