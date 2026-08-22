const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.use(authMiddleware);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today/all', roleCheck('admin', 'hr_officer'), attendanceController.getTodayAttendanceForAll);
router.get('/:employeeId', attendanceController.getEmployeeAttendance);

module.exports = router;
