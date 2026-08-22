// Talks to the `attendance` table. One row per employee per day.
const pool = require('../config/db');

const Attendance = {
  async checkIn(employeeId, date) {
    const { rows } = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in_time, status)
       VALUES ($1, $2, NOW(), 'present')
       ON CONFLICT (employee_id, date)
       DO UPDATE SET check_in_time = NOW(), status = 'present'
       RETURNING *`,
      [employeeId, date]
    );
    return rows[0];
  },

  async checkOut(employeeId, date, workHours, extraHours) {
    const { rows } = await pool.query(
      `UPDATE attendance
       SET check_out_time = NOW(), work_hours = $1, extra_hours = $2
       WHERE employee_id = $3 AND date = $4
       RETURNING *`,
      [workHours, extraHours, employeeId, date]
    );
    return rows[0];
  },

  async findByEmployeeAndDate(employeeId, date) {
    const { rows } = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, date]
    );
    return rows[0];
  },

  async listForEmployee(employeeId, { from, to }) {
    const { rows } = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC`,
      [employeeId, from, to]
    );
    return rows;
  },

  async listForDate(date) {
    const { rows } = await pool.query(
      `SELECT a.*, e.full_name FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.date = $1 ORDER BY e.full_name`,
      [date]
    );
    return rows;
  },

  // Used by payroll: counts present/half-day/leave days in a date range.
  async summaryForPayroll(employeeId, from, to) {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3
       GROUP BY status`,
      [employeeId, from, to]
    );
    return rows;
  },
};

module.exports = Attendance;
