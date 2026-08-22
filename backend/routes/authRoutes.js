const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSignup, validateLogin } = require('../middleware/validateInput');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/verify/:userId', authController.verifyEmail);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
