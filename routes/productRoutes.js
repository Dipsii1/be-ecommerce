const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/productConrtollers');
const { verifyMerchantToken } = require('../middleware/auth');

// get all products
router.get('/', merchantController.getAllProducts);

// get product by id
router.get('/:id', merchantController.getProductsById);

// add product
router.post('/add', verifyMerchantToken, merchantController.addProduct);
module.exports = router;
