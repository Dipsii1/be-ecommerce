var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyMerchantToken } = require('../middleware/auth');
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
    res.json({ succes: true, data: merchants });
  } catch (error) {
    console.error('Error get merchants', error);
    res
      .status(500)
      .json({ succes: false, error: 'Terjadi kesalahan pada server' });
  }
});

// Get Merchant + Products mereka
router.get('/:id', async (req, res) => {
  try {
    const merchantId = parseInt(req.params.id);

    const merchant = await prisma.merchantProfile.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        shopName: true,
        email: true,
        address: true,
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            expired: true,
          },
        },
      },
    });

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, error: 'Merchant tidak ditemukan' });
    }

    res.json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    console.error('Error get merchant with products:', error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
});

// Register Merchant
router.post('/register', async function (req, res) {
  try {
    const { email, password, shopName, address, latitude, longitude } =
      req.body;

    if (!email || !password || !shopName) {
      return res.status(400).json({
        succes: false,
        error: 'Email, password, dan shopName diperlukan',
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: 'Password minimal 8 karakter' });
    }

    const existingMerchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ succes: false, error: 'Email Merchant sudah terdaftar' });
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
        role: 'merchant', //default role
      },
    });

    const { password: _, ...merchantWithoutPassword } = newMerchant;
    res.status(201).json({
      success: true,
      message: 'Merchant berhasil didaftarkan',
      data: merchantWithoutPassword,
    });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
});

// Login Merchant
router.post('/login', async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ succes: false, error: 'Email dan password diperlukan' });
    }

    const merchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });

    if (!merchant) {
      return res
        .status(401)
        .json({ succes: false, error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ succes: false, error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { merchantId: merchant.id, email: merchant.email, role: merchant.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...merchantWithoutPassword } = merchant;

    res.json({
      success: true,
      message: 'Login berhasil',
      data: { merchant: merchantWithoutPassword, token },
    });
  } catch (err) {
    console.log('error login', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
});

// Get Current Merchant Profile
router.get('/me', verifyMerchantToken, async function (req, res) {
  try {
    const merchant = await prisma.merchantProfile.findUnique({
      where: { id: req.merchant.merchantId },
      select: {
        id: true,
        shopName: true,
        email: true,
        address: true,
      },
    });

    if (!merchant) {
      return res
        .status(404)
        .json({ succes: false, error: 'Merchant tidak ditemukan' });
    }

    res.json(merchant);
  } catch (error) {
    console.error('Error saat mengambil data merchant:', error);
    res.status(500).json({
      succes: false,
      error: 'Terjadi kesalahan saat mengambil data merchant',
    });
  }
});

module.exports = router;
