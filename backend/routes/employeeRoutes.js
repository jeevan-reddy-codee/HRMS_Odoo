const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.use(authMiddleware); // every route below requires a signed-in user

router.get('/', roleCheck('admin', 'hr_officer'), employeeController.listEmployees);
router.post('/', roleCheck('admin', 'hr_officer'), employeeController.createEmployee);
router.get('/:id', employeeController.getEmployee);
router.put('/:id', employeeController.updateOwnProfile);
router.put('/:id/admin', roleCheck('admin', 'hr_officer'), employeeController.adminUpdateProfile);

module.exports = router;
