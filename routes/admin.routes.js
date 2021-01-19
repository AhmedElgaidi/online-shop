const express = require('express');

// Import our controllers
const adminControllers = require('../controllers/admin.controllers');
// Import our is-auth middleware
const isAuth = require('../middlewares/is-auth');

// Create my express router instance
const router = express.Router();

//===============================================
// My routes
// (1)
router.get('/products',isAuth , adminControllers.products_get);

// (2)
router.get('/add-product', isAuth, adminControllers.add_Product_get);

// (3)
router.post('/add-product', isAuth, adminControllers.add_product_post);

// (4)
router.get('/edit-product/:productId', isAuth, adminControllers.edit_product_get);

// (5)
router.post('/edit-product', isAuth, adminControllers.edit_product_post);

// (6) 
router.post('/delete-product', isAuth, adminControllers.delete_product_post);

// Export my router instance
module.exports = router;