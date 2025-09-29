var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyUserToken } = require('../middleware/auth');
require('dotenv').config();
const logger = require('../utils/logger');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ambil semua user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Daftar user
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Validasi gagal
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Update user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Hapus user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Ambil profil user login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil user berhasil diambil
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: User tidak ditemukan
 */

// Get All Users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    logger.info('GET /users berhasil diambil', { count: users.length });
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error(`GET /users gagal: ${error.message}`, { stack: error.stack });
    res
      .status(500)
      .json({ success: false, error: 'Gagal mengambil data user' });
  }
});

// Get User by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`GET /users/${id} - User tidak ditemukan`);
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    logger.info(`GET /users/${id} - Berhasil diambil`, { userId: id });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`GET /users/${req.params.id} gagal: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ success: false, error: 'Gagal mengambil data user' });
  }
});
// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      logger.warn('Register gagal: data tidak lengkap');
      return res.status(400).json({
        success: false,
        error: 'Username, email, dan password diperlukan!',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(`Register gagal: email sudah terdaftar (${email})`);
      return res
        .status(400)
        .json({ success: false, error: 'Email sudah terdaftar' });
    }

    if (password.length < 8) {
      logger.warn('Register gagal: password kurang dari 8 karakter');
      return res
        .status(400)
        .json({ success: false, error: 'Password minimal 8 karakter' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: 'user' },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    logger.info(`User berhasil register: ${username} (${email})`);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: userWithoutPassword,
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Gagal registrasi user' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Login gagal: email atau password kosong');
      return res
        .status(400)
        .json({ success: false, error: 'Email dan password diperlukan' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Login gagal: email tidak ditemukan (${email})`);
      return res
        .status(401)
        .json({ success: false, error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`Login gagal: password salah (${email})`);
      return res
        .status(401)
        .json({ success: false, error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    logger.info(`Login berhasil: ${email}`);
    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Gagal login user' });
  }
});

// Update User
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User berhasil diupdate: ID ${id}`);
    res.json({
      success: true,
      message: 'User berhasil diperbarui',
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn(`Update gagal: user tidak ditemukan (ID ${req.params.id})`);
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    logger.error(`Update error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Gagal memperbarui user' });
  }
});

// Delete User
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    logger.info(`User berhasil dihapus: ID ${id}`);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn(`Delete gagal: user tidak ditemukan (ID ${req.params.id})`);
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    logger.error(`Delete error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Gagal menghapus user' });
  }
});

// Get Current User Profile
router.get('/me', verifyUserToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      logger.warn(
        `Profile gagal: user tidak ditemukan (ID ${req.user.userId})`
      );
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    logger.info(`Profile berhasil diambil: ID ${req.user.userId}`);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`, { stack: error.stack });
    res
      .status(500)
      .json({ success: false, error: 'Gagal mengambil profil user' });
  }
});

module.exports = router;
