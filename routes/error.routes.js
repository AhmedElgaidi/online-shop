const express = require('express');

// Import error controllers
const errorControllers = require('../controllers/error.controllers');

// Create my express router instance
const router = express.Router();

//===================================================
// My routes
// 404 Page
router.get('*', errorControllers.error_get);

// Export my router instance
module.exports = router;