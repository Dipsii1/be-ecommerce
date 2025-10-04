const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../middleware/auth');
const cartController = require('../controllers/cartControllers');

// Semua route Cart butuh login user
router.use(verifyUserToken);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API untuk mengelola keranjang belanja user
 */

/**
 * @swagger
 * /carts:
 *   get:
 *     summary: Lihat isi cart user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menampilkan isi cart
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Tambahkan produk ke cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan ke cart
 */
router.post('/', cartController.addToCart);

/**
 * @swagger
 * /carts/item/{itemId}:
 *   put:
 *     summary: Update jumlah produk di cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Jumlah produk di cart berhasil diperbarui
 */
router.put('/item/:itemId', cartController.updateCartItem);

/**
 * @swagger
 * /carts/item/{itemId}:
 *   delete:
 *     summary: Hapus produk dari cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item berhasil dihapus
 */
router.delete('/item/:itemId', cartController.removeCartItem);

/**
 * @swagger
 * /carts/clear:
 *   delete:
 *     summary: Kosongkan seluruh isi cart user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart berhasil dikosongkan
 */
router.delete('/clear', cartController.clearCart);

module.exports = router;
