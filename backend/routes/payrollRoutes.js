const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.use(authMiddleware);

router.get('/:employeeId', payrollController.getSalary); // read-only for employees (enforced client-side + by only exposing view)
router.put('/:employeeId', roleCheck('admin', 'hr_officer'), payrollController.updateSalary);

module.exports = router;
