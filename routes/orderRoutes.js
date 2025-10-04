const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const { verifyUserToken } = require('../middleware/auth');

// Protect all routes for logged-in users only
router.use(verifyUserToken);

/**
 * @route POST /orders/checkout
 * @desc Create a new order (checkout from cart)
 */
router.post('/checkout', orderController.checkout);

/**
 * @route GET /orders
 * @desc Get user order history
 */
router.get('/', orderController.getUserOrders);

/**
 * @route GET /orders/:id
 * @desc Get specific order detail
 */
router.get('/:id', orderController.getOrderById);

module.exports = router;
