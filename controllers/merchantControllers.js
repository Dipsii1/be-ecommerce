const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all merchants
exports.getAllMerchants = async (req, res) => {
  try {
    const merchants = await prisma.merchantProfile.findMany({
      select: {
        id: true,
        shopName: true,
        email: true,
        role: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Merchants retrieved successfully',
      data: merchants,
    });
  } catch (error) {
    console.error('❌ Error fetching merchants:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get merchant by ID (with products)
exports.getMerchantById = async (req, res) => {
  try {
    const merchantId = parseInt(req.params.id);
    if (isNaN(merchantId)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid merchant ID' });
    }

    const merchant = await prisma.merchantProfile.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        shopName: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            expired: true,
            isExpired: true,
          },
          where: {
            OR: [{ isExpired: false }, { expired: { gt: new Date() } }],
          },
        },
      },
    });

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, error: 'Merchant not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Merchant retrieved successfully',
      data: merchant,
    });
  } catch (error) {
    console.error('❌ Error retrieving merchant:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Register merchant
exports.registerMerchant = async (req, res) => {
  try {
    const { email, password, shopName, address, latitude, longitude } =
      req.body;

    if (!email || !password || !shopName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and shopName are required',
      });
    }

    if (!email.includes('@')) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
    }

    const existingMerchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });
    if (existingMerchant) {
      return res
        .status(400)
        .json({ success: false, error: 'Email already registered' });
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
      message: 'Merchant registered successfully',
      data: merchantWithoutPassword,
    });
  } catch (error) {
    console.error('❌ Error registering merchant:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Login merchant
exports.loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required' });
    }

    const merchant = await prisma.merchantProfile.findUnique({
      where: { email },
    });
    if (!merchant) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { merchantId: merchant.id, email: merchant.email, role: merchant.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...merchantWithoutPassword } = merchant;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { merchant: merchantWithoutPassword, token },
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update merchant
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

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'No fields to update' });
    }

    const merchant = await prisma.merchantProfile.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    const { password: _, ...merchantWithoutPassword } = merchant;

    res.status(200).json({
      success: true,
      message: 'Merchant updated successfully',
      data: merchantWithoutPassword,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res
        .status(404)
        .json({ success: false, error: 'Merchant not found' });
    }

    console.error('❌ Error updating merchant:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Delete merchant
exports.deleteMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.merchantProfile.delete({ where: { id: parseInt(id) } });

    res
      .status(200)
      .json({ success: true, message: 'Merchant deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res
        .status(404)
        .json({ success: false, error: 'Merchant not found' });
    }

    console.error('❌ Error deleting merchant:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get current logged-in merchant profile
exports.getCurrentMerchant = async (req, res) => {
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
      },
    });

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, error: 'Merchant not found' });
    }

    res.status(200).json({ success: true, data: merchant });
  } catch (error) {
    console.error('❌ Error fetching current merchant:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
