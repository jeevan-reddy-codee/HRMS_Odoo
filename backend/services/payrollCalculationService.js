/**
 * Implements the salary-component math described in the Salary Info wireframe notes:
 *   Basic Salary            = 50%    of Wage
 *   HRA                     = 50%    of Basic
 *   Standard Allowance      = 16.67% of Basic  (≈ ₹4,167 on a ₹25,000 basic)
 *   Performance Bonus       = 8.33%  of Basic
 *   Leave Travel Allowance  = 8.33%  of Basic
 *   Fixed Allowance         = Wage - sum(all the above components)
 *   PF (Employee & Employer)= 12%    of Basic each
 *   Professional Tax        = fixed amount (default ₹200/month)
 */
function calculateSalaryComponents(monthlyWage, professionalTax = 200) {
  const basicSalary = round2(monthlyWage * 0.5);
  const hra = round2(basicSalary * 0.5);
  const standardAllowance = round2(basicSalary * 0.1667);
  const performanceBonus = round2(basicSalary * 0.0833);
  const leaveTravelAllowance = round2(basicSalary * 0.0833);

  const componentsSoFar = basicSalary + hra + standardAllowance + performanceBonus + leaveTravelAllowance;
  const fixedAllowance = round2(monthlyWage - componentsSoFar);

  const pfEmployee = round2(basicSalary * 0.12);
  const pfEmployer = round2(basicSalary * 0.12);

  return {
    monthlyWage,
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    leaveTravelAllowance,
    fixedAllowance,
    pfEmployee,
    pfEmployer,
    professionalTax,
    grossEarnings: round2(componentsSoFar + fixedAllowance),
    totalDeductions: round2(pfEmployee + professionalTax),
    netPay: round2(componentsSoFar + fixedAllowance - pfEmployee - professionalTax),
  };
}

/**
 * Reduces payable days based on unpaid leave / absent days in the period,
 * per the wireframe note: "Any unpaid leave or missing attendance days
 * should automatically reduce the number of payable days."
 */
function calculatePayableDays(totalDaysInMonth, unpaidLeaveDays, absentDays) {
  const payableDays = totalDaysInMonth - unpaidLeaveDays - absentDays;
  return Math.max(0, payableDays);
}

/** Pro-rates net pay if payable days are less than the full month. */
function prorateForPayableDays(netPay, totalDaysInMonth, payableDays) {
  if (payableDays >= totalDaysInMonth) return netPay;
  return round2((netPay / totalDaysInMonth) * payableDays);
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

module.exports = { calculateSalaryComponents, calculatePayableDays, prorateForPayableDays };
