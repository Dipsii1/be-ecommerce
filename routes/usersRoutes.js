var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyUserToken } = require('../middleware/auth');
require('dotenv').config();

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
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error get users:', error);
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
      return res
        .status(400)
        .json({
          success: false,
          error: 'Username, email, dan password diperlukan!',
        });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: 'Email sudah terdaftar' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, error: 'Password minimal 8 karakter' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: 'user' },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res
      .status(201)
      .json({
        success: true,
        message: 'Registrasi berhasil',
        data: userWithoutPassword,
      });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, error: 'Gagal registrasi user' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email dan password diperlukan' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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
    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error('Error login:', error);
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
    res.json({
      success: true,
      message: 'User berhasil diperbarui',
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error update user:', error);

    if (error.code === 'P2025') {
      // Prisma error: record not found
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    res.status(500).json({ success: false, error: 'Gagal memperbarui user' });
  }
});

// Delete User
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error delete user:', error);

    if (error.code === 'P2025') {
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

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
      return res
        .status(404)
        .json({ success: false, error: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error get profile:', error);
    res
      .status(500)
      .json({ success: false, error: 'Gagal mengambil profil user' });
  }
});

module.exports = router;
