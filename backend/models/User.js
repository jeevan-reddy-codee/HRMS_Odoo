// Talks to the `users` table. Every function returns plain rows from pg.
const pool = require('../config/db');

const User = {
  async create({ loginId, email, passwordHash, role }) {
    const { rows } = await pool.query(
      `INSERT INTO users (login_id, email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, $4, false) RETURNING id, login_id, email, role`,
      [loginId, email, passwordHash, role]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  async markVerified(id) {
    await pool.query('UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1', [id]);
  },

  async updatePassword(id, passwordHash) {
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, id]);
  },
};

module.exports = User;
