const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// ✅ Get All Merchants
exports.getAllMerchants = async (req, res) => {
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
    res.json({ success: true, data: merchants });
  } catch (error) {
    console.error('Error get merchants', error);
    res
      .status(500)
      .json({ success: false, error: 'Terjadi kesalahan pada server' });
  }
};

//  Get Merchant + Products
exports.getMerchantById = async (req, res) => {
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

    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error('Error get merchant with products:', error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};

//  Register Merchant
exports.registerMerchant = async (req, res) => {
  try {
    const { email, password, shopName, address, latitude, longitude } =
      req.body;

    if (!email || !password || !shopName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, dan shopName diperlukan',
      });
    }

    if (password.length < 8) {
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
        .json({ success: false, error: 'Email Merchant sudah terdaftar' });
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
        role: 'merchant',
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
};

//  Login Merchant
exports.loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email dan password diperlukan' });
    }

    const merchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });
    if (!merchant) {
      return res
        .status(401)
        .json({ success: false, error: 'Email atau password salah' });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Email atau password salah' });
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
    console.error('error login', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};

// Update Merchant
exports.updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { shopName, email, password, address, latitude, longitude } =
      req.body;

    const updateData = {};

    if (shopName) updateData.shopName = shopName;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const merchant = await prisma.merchantProfile.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // hilangkan password dari response
    const { password: _, ...merchantWithoutPassword } = merchant;

    logger?.info(`Merchant berhasil diupdate: ID ${id}`);
    res.json({
      success: true,
      message: 'Merchant berhasil diperbarui',
      data: merchantWithoutPassword,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      logger?.warn(
        `Update gagal: merchant tidak ditemukan (ID ${req.params.id})`
      );
      return res
        .status(404)
        .json({ success: false, error: 'Merchant tidak ditemukan' });
    }

    logger?.error(`Update error: ${error.message}`, { stack: error.stack });
    res
      .status(500)
      .json({ success: false, error: 'Gagal memperbarui merchant' });
  }
};

//  Delete Merchant
exports.deleteMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.merchantProfile.delete({ where: { id: parseInt(id) } });
    logger.info(`merchant berhasil dihapus: ID ${id}`);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn(
        `Delete gagal: Merchant tidak ditemukan (ID ${req.params.id})`
      );
      return res
        .status(404)
        .json({ success: false, error: 'merchant tidak ditemukan' });
    }

    logger.error(`Delete error: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Gagal menghapus merchant' });
  }
};

//  Get Current Merchant Profile
exports.getCurrentMerchant = async (req, res) => {
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
        .json({ success: false, error: 'Merchant tidak ditemukan' });
    }

    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error('Error saat mengambil data merchant:', error);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
  }
};
