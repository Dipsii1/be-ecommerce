var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get All Users
router.get('/', async function (req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
  res.json(users);
});

// Create User (Register)
router.post('/register', async function (req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email dan password diperlukan' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
});

// Login Endpoint
router.post('/login', async function (req, res) {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});

// Update User
router.put('/update/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    // Jangan tampilkan password di response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error saat update user:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui user' });
  }
});

// Delete User
router.delete('/delete/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const _ = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error saat menghapus user:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus user' });
  }
});

// Middleware untuk verifikasi token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ err });
  }
};

// Endpoint untuk mendapatkan profil user saat ini (dengan proteksi token)
router.get('/me', verifyToken, async function (req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        // Tidak menampilkan password
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error saat mengambil data user:', error);
    res
      .status(500)
      .json({ error: 'Terjadi kesalahan saat mengambil data user' });
  }
});

module.exports = router;
