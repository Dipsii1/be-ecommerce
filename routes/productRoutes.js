var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get All Product

router.get('/', async function (req, res) {
  const product = await prisma.product.findMany({
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
  res.json(product);
});

// get for id

router.get('/:id', async function (req, res) {
  const { id } = req.params; // ambil id dari URL
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }, // id harus di-convert ke integer
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
      return res.status(404).json({ error: 'Product tidak ditemukan' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambah Product
router.post(
  '/add',
  verifyToken,
  authorizeRoles('admin', 'merchant'),
  async (req, res) => {
    try {
      const { name, description, price, stock, expired } = req.body;

      const merchantProfile = await prisma.merchantProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (!merchantProfile) {
        return res.status(400).json({
          error: 'Merchant profile tidak ditemukan untuk user ini',
        });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: parseFloat(stock),
          expired: expired ? new Date(expired) : null,
          merchantId: req.user.merchantId, // simpan siapa yang buat
        },
      });

      res.status(201).json({
        message: 'product berhasil di tambahkan',
        product: newProduct,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
