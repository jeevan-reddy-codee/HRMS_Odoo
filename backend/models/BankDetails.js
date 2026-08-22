// Talks to the `bank_details` table (the "Private Info" tab on the profile page).
const pool = require('../config/db');

const BankDetails = {
  async findByEmployeeId(employeeId) {
    const { rows } = await pool.query(
      'SELECT * FROM bank_details WHERE employee_id = $1',
      [employeeId]
    );
    return rows[0];
  },

  async upsert(employeeId, { accountNumber, bankName, ifscCode, panNo, uanNo, empCode }) {
    const { rows } = await pool.query(
      `INSERT INTO bank_details (employee_id, account_number, bank_name, ifsc_code, pan_no, uan_no, emp_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (employee_id) DO UPDATE SET
         account_number = EXCLUDED.account_number,
         bank_name = EXCLUDED.bank_name,
         ifsc_code = EXCLUDED.ifsc_code,
         pan_no = EXCLUDED.pan_no,
         uan_no = EXCLUDED.uan_no,
         emp_code = EXCLUDED.emp_code
       RETURNING *`,
      [employeeId, accountNumber, bankName, ifscCode, panNo, uanNo, empCode]
    );
    return rows[0];
  },
};

module.exports = BankDetails;
