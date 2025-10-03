const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantControllers');
const { verifyMerchantToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Merchants
 *   description: Merchant management APIs
 */

/**
 * @swagger
 * /merchants:
 *   get:
 *     summary: Get all merchants
 *     tags: [Merchants]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of merchants
 *       500:
 *         description: Internal server error
 */
router.get('/', merchantController.getAllMerchants);

/**
 * @swagger
 * /merchants/{id}:
 *   get:
 *     summary: Get merchant by ID
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Merchant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Merchant found
 *       400:
 *         description: Invalid ID format
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *       400:
 *         description: Missing or invalid data
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', merchantController.registerMerchant);

/**
 * @swagger
 * /merchants/login:
 *   post:
 *     summary: Login merchant
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
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
 *         description: Merchant ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Merchant updated successfully
 *       400:
 *         description: Invalid data or ID format
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
 *         description: Merchant ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Merchant deleted successfully
 *       400:
 *         description: Invalid ID format
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
 *         description: Successfully retrieved current merchant profile
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/me', verifyMerchantToken, merchantController.getCurrentMerchant);

module.exports = router;
