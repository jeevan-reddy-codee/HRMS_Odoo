// Talks to the `leave_requests` table.
const pool = require('../config/db');

const LeaveRequest = {
  async create({ employeeId, leaveType, startDate, endDate, remarks, attachmentUrl }) {
    const { rows } = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, attachment_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employeeId, leaveType, startDate, endDate, remarks, attachmentUrl]
    );
    return rows[0];
  },

  async listForEmployee(employeeId) {
    const { rows } = await pool.query(
      'SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC',
      [employeeId]
    );
    return rows;
  },

  async listAll(status) {
    const query = status
      ? `SELECT l.*, e.full_name FROM leave_requests l JOIN employees e ON e.id = l.employee_id
         WHERE l.status = $1 ORDER BY l.created_at DESC`
      : `SELECT l.*, e.full_name FROM leave_requests l JOIN employees e ON e.id = l.employee_id
         ORDER BY l.created_at DESC`;
    const { rows } = await pool.query(query, status ? [status] : []);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    return rows[0];
  },

  async updateStatus(id, status, approverId, comment) {
    const { rows } = await pool.query(
      `UPDATE leave_requests
       SET status = $1, approved_by = $2, admin_comment = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, approverId, comment, id]
    );
    return rows[0];
  },

  // Counts approved paid/sick leave days used this year, for showing remaining balance.
  async approvedDaysUsedThisYear(employeeId, leaveType) {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM((end_date - start_date) + 1), 0)::int AS days_used
       FROM leave_requests
       WHERE employee_id = $1 AND leave_type = $2 AND status = 'approved'
         AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [employeeId, leaveType]
    );
    return rows[0].days_used;
  },
};

module.exports = LeaveRequest;
