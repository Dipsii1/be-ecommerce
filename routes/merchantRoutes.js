const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantControllers');
const { verifyMerchantToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Merchants
 *   description: Merchant management and authentication
 */

/**
 * @swagger
 * /merchants:
 *   get:
 *     summary: Get all merchants
 *     tags: [Merchants]
 *     responses:
 *       200:
 *         description: List of all merchants
 *       500:
 *         description: Internal server error
 */
router.get('/', merchantController.getAllMerchants);

/**
 * @swagger
 * /merchants/{id}:
 *   get:
 *     summary: Get merchant by ID (with product list)
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Merchant details retrieved successfully
 *       400:
 *         description: Invalid merchant ID
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', merchantController.getMerchantById);

/**
 * @swagger
 * /merchants/register:
 *   post:
 *     summary: Register a new merchant
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - email
 *               - password
 *             properties:
 *               shopName:
 *                 type: string
 *                 example: "Crafix Coffee"
 *               email:
 *                 type: string
 *                 example: "merchant@crafix.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *               address:
 *                 type: string
 *                 example: "Jl. Sudirman No. 45, Jakarta"
 *               latitude:
 *                 type: number
 *                 example: -6.21462
 *               longitude:
 *                 type: number
 *                 example: 106.84513
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *       400:
 *         description: Invalid input or email already registered
 *       500:
 *         description: Internal server error
 */
router.post('/register', merchantController.registerMerchant);

/**
 * @swagger
 * /merchants/login:
 *   post:
 *     summary: Login a merchant and get JWT token
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "merchant@crafix.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', merchantController.loginMerchant);

/**
 * @swagger
 * /merchants/update/{id}:
 *   put:
 *     summary: Update merchant by ID
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopName:
 *                 type: string
 *                 example: "Updated Shop Name"
 *               email:
 *                 type: string
 *                 example: "newemail@shop.com"
 *               password:
 *                 type: string
 *                 example: "NewPassword123"
 *               address:
 *                 type: string
 *                 example: "Jl. Diponegoro No. 99, Bandung"
 *               latitude:
 *                 type: number
 *                 example: -6.2
 *               longitude:
 *                 type: number
 *                 example: 106.8
 *     responses:
 *       200:
 *         description: Merchant updated successfully
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', merchantController.updateMerchant);

/**
 * @swagger
 * /merchants/delete/{id}:
 *   delete:
 *     summary: Delete merchant by ID
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Merchant deleted successfully
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', merchantController.deleteMerchant);

/**
 * @swagger
 * /merchants/me:
 *   get:
 *     summary: Get current logged-in merchant's profile
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 */
router.get('/me', verifyMerchantToken, merchantController.getCurrentMerchant);

module.exports = router;
