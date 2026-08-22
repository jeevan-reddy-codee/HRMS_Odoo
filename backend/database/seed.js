// Seeds the database with a demo admin + employee so you have data to test with.
// Run with: node backend/database/seed.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const generateLoginID = require('../utils/generateLoginID');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const adminLoginId = generateLoginID('Priya', 'Sharma', 2026, 1);
    const adminUser = await client.query(
      `INSERT INTO users (login_id, email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, 'admin', true) RETURNING id`,
      [adminLoginId, 'priya.sharma@dayflow.com', adminPassword]
    );
    const adminUserId = adminUser.rows[0].id;

    const adminEmployee = await client.query(
      `INSERT INTO employees (user_id, full_name, phone, department, job_position, date_of_joining)
       VALUES ($1, 'Priya Sharma', '9876543210', 'Human Resources', 'HR Manager', '2022-01-10')
       RETURNING id`,
      [adminUserId]
    );
    const adminEmployeeId = adminEmployee.rows[0].id;

    // 2. Regular employee, reporting to the admin
    const empPassword = await bcrypt.hash('Employee@123', 10);
    const empLoginId = generateLoginID('John', 'Doe', 2026, 2);
    const empUser = await client.query(
      `INSERT INTO users (login_id, email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, 'employee', true) RETURNING id`,
      [empLoginId, 'john.doe@dayflow.com', empPassword]
    );
    const empUserId = empUser.rows[0].id;

    const empEmployee = await client.query(
      `INSERT INTO employees (user_id, full_name, phone, department, manager_id, job_position, date_of_joining)
       VALUES ($1, 'John Doe', '9123456780', 'Engineering', $2, 'Software Engineer', '2024-03-15')
       RETURNING id`,
      [empUserId, adminEmployeeId]
    );
    const empEmployeeId = empEmployee.rows[0].id;

    // 3. Salary structure for the employee (auto-calculated example: wage = 50000)
    const wage = 50000;
    const basic = wage * 0.5;
    await client.query(
      `INSERT INTO salary_structure
        (employee_id, monthly_wage, basic_salary, hra, standard_allowance,
         performance_bonus, leave_travel_allowance, fixed_allowance,
         pf_employee, pf_employer, professional_tax)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        empEmployeeId, wage, basic, basic * 0.5, basic * 0.1667,
        basic * 0.0833, basic * 0.0833,
        wage - (basic + basic * 0.5 + basic * 0.1667 + basic * 0.0833 + basic * 0.0833),
        basic * 0.12, basic * 0.12, 200
      ]
    );

    // 4. Sample attendance (today)
    await client.query(
      `INSERT INTO attendance (employee_id, date, check_in_time, status, work_hours)
       VALUES ($1, CURRENT_DATE, NOW(), 'present', 8)`,
      [empEmployeeId]
    );

    // 5. Sample leave request
    await client.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, status)
       VALUES ($1, 'paid', CURRENT_DATE + 5, CURRENT_DATE + 6, 'Family function', 'pending')`,
      [empEmployeeId]
    );

    await client.query('COMMIT');
    console.log('✅ Seed complete.');
    console.log(`   Admin login:    ${adminLoginId} / priya.sharma@dayflow.com / Admin@123`);
    console.log(`   Employee login: ${empLoginId} / john.doe@dayflow.com / Employee@123`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
