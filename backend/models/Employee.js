// Talks to the `employees` table, which stores the profile info shown
// on the Profile page (basic details, job info, resume, etc).
const pool = require('../config/db');

const Employee = {
  async create({ userId, fullName, department, jobPosition, dateOfJoining, managerId = null, phone = null }) {
    const { rows } = await pool.query(
      `INSERT INTO employees (user_id, full_name, department, job_position, date_of_joining, manager_id, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, fullName, department, jobPosition, dateOfJoining, managerId, phone]
    );
    return rows[0];
  },

  async findByUserId(userId) {
    const { rows } = await pool.query('SELECT * FROM employees WHERE user_id = $1', [userId]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT e.*, u.email, u.login_id, u.role
       FROM employees e JOIN users u ON u.id = e.user_id
       WHERE e.id = $1`,
      [id]
    );
    return rows[0];
  },

  async listAll() {
    const { rows } = await pool.query(
      `SELECT e.id, e.full_name, e.department, e.job_position, e.profile_picture_url, u.email, u.role
       FROM employees e JOIN users u ON u.id = e.user_id
       ORDER BY e.full_name ASC`
    );
    return rows;
  },

  // Employees can only edit a limited set of fields (address, phone, picture).
  async updateLimited(id, { phone, address, profilePictureUrl }) {
    const { rows } = await pool.query(
      `UPDATE employees SET phone = COALESCE($1, phone),
                             address = COALESCE($2, address),
                             profile_picture_url = COALESCE($3, profile_picture_url),
                             updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [phone, address, profilePictureUrl, id]
    );
    return rows[0];
  },

  // Admin can edit any field on the profile.
  async updateFull(id, fields) {
    const allowed = [
      'full_name', 'phone', 'address', 'department', 'manager_id', 'job_position',
      'location', 'date_of_joining', 'date_of_birth', 'nationality', 'gender',
      'marital_status', 'personal_email', 'about', 'skills', 'certifications',
    ];
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${i}`);
        values.push(fields[key]);
        i++;
      }
    }
    if (setClauses.length === 0) return this.findById(id);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE employees SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0];
  },
};

module.exports = Employee;
