const express = require('express');

// Import our controllers
const shopControllers = require('../controllers/shop.controllers');

// Import our is-auth middleware
const isAuth = require('../middlewares/is-auth');

// Create my express router instance
const router = express.Router();

//===================================================
// My routes
// (1)
router.get('/', shopControllers.index_get);
// (2)
router.get('/products', shopControllers.products_get);
// (3)
router.get('/products/:productId', shopControllers.product_get);
// (4)
router.get('/cart', isAuth, shopControllers.cart_get);
// (5)
router.post('/cart', isAuth, shopControllers.cart_post)
// (6)
router.post('/cart-delete-item', isAuth, shopControllers.deleteproduct_post);
// (7)
router.get('/order', isAuth, shopControllers.orders_get);
// (8)
router.get('/checkout', isAuth, shopControllers.checkout_get);

// Export my router instance
module.exports = router;