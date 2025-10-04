const express = require('express');
const router = express.Router();
const productController = require('../controllers/productConrtollers');
const { verifyMerchantToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (CRUD for merchants)
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Internal server error
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Add a new product (Merchant only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nasi Goreng Spesial"
 *               description:
 *                 type: string
 *                 example: "Nasi goreng dengan telur dan ayam"
 *               price:
 *                 type: number
 *                 example: 25000
 *               stock:
 *                 type: integer
 *                 example: 20
 *               expired:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T00:00:00Z"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       500:
 *         description: Internal server error
 */
router.post('/add', verifyMerchantToken, productController.addProduct);

module.exports = router;
