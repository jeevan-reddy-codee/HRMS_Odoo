// Handles /api/dashboard/* — aggregated data so the dashboard pages
// don't need to make five separate requests on load.
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { todayISO } = require('../utils/dateUtils');

// GET /api/dashboard/admin
async function getAdminDashboard(req, res, next) {
  try {
    const [employees, todayAttendance, pendingLeave] = await Promise.all([
      Employee.listAll(),
      Attendance.listForDate(todayISO()),
      LeaveRequest.listAll('pending'),
    ]);

    // Build a quick lookup of today's status per employee for the status-dot UI.
    const statusByEmployee = {};
    todayAttendance.forEach((a) => { statusByEmployee[a.employee_id] = a.status; });

    const employeesWithStatus = employees.map((e) => ({
      ...e,
      todayStatus: statusByEmployee[e.id] || 'absent',
    }));

    res.json({
      totalEmployees: employees.length,
      presentToday: todayAttendance.filter((a) => a.status === 'present').length,
      pendingLeaveCount: pendingLeave.length,
      employees: employeesWithStatus,
      pendingLeave,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/employee/:employeeId
async function getEmployeeDashboard(req, res, next) {
  try {
    const { employeeId } = req.params;
    const [today, leaveData] = await Promise.all([
      Attendance.findByEmployeeAndDate(employeeId, todayISO()),
      LeaveRequest.listForEmployee(employeeId),
    ]);

    res.json({
      todayAttendance: today || { status: 'not-checked-in' },
      recentLeaveRequests: leaveData.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAdminDashboard, getEmployeeDashboard };
