const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.use(authMiddleware);

router.get('/admin', roleCheck('admin', 'hr_officer'), dashboardController.getAdminDashboard);
router.get('/employee/:employeeId', dashboardController.getEmployeeDashboard);

module.exports = router;
