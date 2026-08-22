// Talks to the `salary_structure` table. The actual math for the
// components lives in services/payrollCalculationService.js — this
// model just persists whatever the service computes.
const pool = require('../config/db');

const Salary = {
  async findByEmployeeId(employeeId) {
    const { rows } = await pool.query(
      'SELECT * FROM salary_structure WHERE employee_id = $1',
      [employeeId]
    );
    return rows[0];
  },

  async upsert(employeeId, components) {
    const {
      monthlyWage, basicSalary, hra, standardAllowance, performanceBonus,
      leaveTravelAllowance, fixedAllowance, pfEmployee, pfEmployer, professionalTax,
    } = components;

    const { rows } = await pool.query(
      `INSERT INTO salary_structure
        (employee_id, monthly_wage, basic_salary, hra, standard_allowance,
         performance_bonus, leave_travel_allowance, fixed_allowance,
         pf_employee, pf_employer, professional_tax, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
       ON CONFLICT (employee_id) DO UPDATE SET
         monthly_wage = EXCLUDED.monthly_wage,
         basic_salary = EXCLUDED.basic_salary,
         hra = EXCLUDED.hra,
         standard_allowance = EXCLUDED.standard_allowance,
         performance_bonus = EXCLUDED.performance_bonus,
         leave_travel_allowance = EXCLUDED.leave_travel_allowance,
         fixed_allowance = EXCLUDED.fixed_allowance,
         pf_employee = EXCLUDED.pf_employee,
         pf_employer = EXCLUDED.pf_employer,
         professional_tax = EXCLUDED.professional_tax,
         updated_at = NOW()
       RETURNING *`,
      [employeeId, monthlyWage, basicSalary, hra, standardAllowance, performanceBonus,
        leaveTravelAllowance, fixedAllowance, pfEmployee, pfEmployer, professionalTax]
    );
    return rows[0];
  },
};

module.exports = Salary;
