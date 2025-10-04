const express = require('express');
const router = express.Router();
const { verifyMerchantToken } = require('../middleware/auth');
const merchantOrderController = require('../controllers/merchantOrderControllers');

// All merchant order routes require authentication
router.use(verifyMerchantToken);

/**
 * @route GET /merchants/orders
 * @desc Get all orders related to the merchant’s products
 */
router.get('/', merchantOrderController.getMerchantOrders);

/**
 * @route GET /merchants/orders/:id
 * @desc Get a specific order detail related to the merchant
 */
router.get('/:id', merchantOrderController.getMerchantOrderDetail);

module.exports = router;
