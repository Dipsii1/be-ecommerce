var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const { verifyMerchantToken } = require('../middleware/auth');

// Get All Products
router.get('/', async function (req, res) {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        expired: true,
        merchantId: true,
      },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      detail: error.message,
    });
  }
});

// Get Product by ID
router.get('/:id', async function (req, res) {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        expired: true,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product tidak ditemukan' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      detail: error.message,
    });
  }
});

// Tambah Product
router.post('/add', verifyMerchantToken, async (req, res) => {
  try {
    const { name, description, price, stock, expired } = req.body;

    // validasi input
    if (!name || !price || !stock) {
      return res.status(400).json({
        success: false,
        error: 'Field name, price, dan stock wajib diisi',
      });
    }

    if (!req.merchant || !req.merchant.merchantId) {
      return res.status(400).json({
        success: false,
        error:
          'merchantId tidak ditemukan di token. Pastikan login sebagai merchant',
      });
    }

    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { id: req.merchant.merchantId },
    });

    if (!merchantProfile) {
      return res.status(400).json({
        success: false,
        error: 'Merchant profile tidak ditemukan untuk user ini',
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        expired: expired ? new Date(expired) : null,
        merchantId: merchantProfile.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product berhasil ditambahkan',
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server',
      detail: error.message,
    });
  }
});

module.exports = router;
