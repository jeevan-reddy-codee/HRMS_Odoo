// Powers payroll.html — read-only salary view for employees,
// editable wage + auto-calculated breakdown for admin.

document.addEventListener('DOMContentLoaded', () => {
  const user = getStoredUser();
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const employeeId = params.get('id') || user.employeeId;
  const isAdmin = ['admin', 'hr_officer'].includes(user.role);

  loadSalary(employeeId);

  const wageForm = document.getElementById('update-wage-form');
  if (isAdmin && wageForm) {
    wageForm.classList.remove('hidden');
    wageForm.addEventListener('submit', (e) => handleUpdateWage(e, employeeId));
  }
});

async function loadSalary(employeeId) {
  try {
    const salary = await api.getSalary(employeeId);
    renderSalary(salary);
  } catch (err) {
    document.getElementById('payroll-empty-state')?.classList.remove('hidden');
  }
}

function renderSalary(s) {
  const fields = {
    'salary-monthly-wage': s.monthly_wage,
    'salary-yearly-wage': s.yearly_wage,
    'salary-basic': s.basic_salary,
    'salary-hra': s.hra,
    'salary-standard-allowance': s.standard_allowance,
    'salary-performance-bonus': s.performance_bonus,
    'salary-lta': s.leave_travel_allowance,
    'salary-fixed-allowance': s.fixed_allowance,
    'salary-pf-employee': s.pf_employee,
    'salary-pf-employer': s.pf_employer,
    'salary-professional-tax': s.professional_tax,
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatCurrency(value);
  });

  const netPay = Number(s.monthly_wage) - Number(s.pf_employee) - Number(s.professional_tax);
  const netPayEl = document.getElementById('salary-net-pay');
  if (netPayEl) netPayEl.textContent = formatCurrency(netPay);
}

async function handleUpdateWage(e, employeeId) {
  e.preventDefault();
  const monthlyWage = document.getElementById('input-monthly-wage').value;
  const errorBox = document.getElementById('wage-form-error');
  errorBox.textContent = '';

  try {
    const updated = await api.updateSalary(employeeId, { monthlyWage });
    renderSalary(updated);
    showToast('Salary structure updated.', 'success');
  } catch (err) {
    errorBox.textContent = err.message;
  }
}
