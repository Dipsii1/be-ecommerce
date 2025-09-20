var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get All Merchants
router.get('/', async function (req, res) {
  try {
    const merchants = await prisma.merchantProfile.findMany({
      select: {
        id: true,
        shopName: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });
    res.json(merchants);
  } catch (error) {
    console.error('Error saat ambil merchant:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat ambil merchant' });
  }
});

// Register Merchant
router.post('/register', async function (req, res) {
  try {
    const { email, password, shopName, address, latitude, longitude } =
      req.body;

    if (!email || !password || !shopName) {
      return res
        .status(400)
        .json({ error: 'Email, password, dan shopName diperlukan' });
    }

    const existingMerchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });

    if (existingMerchant) {
      return res.status(400).json({ error: 'Email Merchant sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMerchant = await prisma.merchantProfile.create({
      data: {
        shopName,
        email,
        password: hashedPassword,
        address,
        latitude,
        longitude,
      },
    });

    const { password: _, ...merchantWithoutPassword } = newMerchant;
    res.status(201).json(merchantWithoutPassword);
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
});

// Login Merchant
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    const merchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });

    if (!merchant) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { merchantId: merchant.id, email: merchant.email, role: merchant.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...merchantWithoutPassword } = merchant;

    res.json({
      merchant: merchantWithoutPassword,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login merchant' });
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
    req.merchant = decoded; // simpan payload merchant
    next();
  } catch (error) {
    console.error('Error saat login merchant:', error);
    res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

// Get Current Merchant Profile
router.get('/me', verifyToken, async function (req, res) {
  try {
    const merchant = await prisma.merchantProfile.findUnique({
      where: { id: req.merchant.merchantId },
      select: {
        id: true,
        shopName: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant tidak ditemukan' });
    }

    res.json(merchant);
  } catch (error) {
    console.error('Error saat mengambil data merchant:', error);
    res
      .status(500)
      .json({ error: 'Terjadi kesalahan saat mengambil data merchant' });
  }
});

module.exports = router;
