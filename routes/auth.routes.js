const express = require('express');

// Import our controllers
const authControllers = require('../controllers/auth.controllers');

// Create my express router instance
const router = express.Router();

//=========================================

router.get('/login', authControllers.login_get);
router.post('/login', authControllers.login_post);
router.get('/signup', authControllers.signup_get);
router.post('/signup', authControllers.signup_post);
router.get('/logout', authControllers.logout_get);
router.get('/reset-password', authControllers.resetPassword_get);
router.post('/reset-password', authControllers.resetPassword_post);
router.get('/new-password/:token', authControllers.newPassword_get);
// With this token as a param, makes it hard to reach this route with invalid token
router.post('/new-password', authControllers.newPassword_post);

//=========================================
// Export my router instance
module.exports = router;