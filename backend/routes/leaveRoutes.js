const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');
const { validateLeaveRequest } = require('../middleware/validateInput');

router.use(authMiddleware);

router.post('/', validateLeaveRequest, leaveController.applyForLeave);
router.get('/', roleCheck('admin', 'hr_officer'), leaveController.listAllLeave);
router.get('/:employeeId', leaveController.getEmployeeLeave);
router.put('/:id/status', roleCheck('admin', 'hr_officer'), leaveController.updateLeaveStatus);

module.exports = router;
