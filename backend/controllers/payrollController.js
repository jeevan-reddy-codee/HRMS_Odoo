// Handles /api/payroll/* — viewing salary breakdown and (admin) updating wage.
const Salary = require('../models/Salary');
const { calculateSalaryComponents } = require('../services/payrollCalculationService');

// GET /api/payroll/:employeeId  — read-only view for employees, full detail for admin
async function getSalary(req, res, next) {
  try {
    const salary = await Salary.findByEmployeeId(req.params.employeeId);
    if (!salary) return res.status(404).json({ message: 'No salary structure defined yet.' });
    res.json(salary);
  } catch (err) {
    next(err);
  }
}

// PUT /api/payroll/:employeeId  (Admin only) — set/update the monthly wage;
// all components are then auto-calculated per the wireframe's salary formula.
async function updateSalary(req, res, next) {
  try {
    const { monthlyWage, professionalTax } = req.body;
    if (!monthlyWage || monthlyWage <= 0) {
      return res.status(400).json({ message: 'A valid monthly wage is required.' });
    }

    const components = calculateSalaryComponents(Number(monthlyWage), Number(professionalTax) || 200);
    const saved = await Salary.upsert(req.params.employeeId, components);
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSalary, updateSalary };
