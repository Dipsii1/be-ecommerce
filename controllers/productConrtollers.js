const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { isExpired: false },
          { expired: { gt: new Date() } }, // belum kadaluarsa
          { expired: null },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        expired: true,
        isExpired: true,
        merchant: {
          select: { id: true, shopName: true, address: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        expired: true,
        isExpired: true,
        merchant: {
          select: { id: true, shopName: true },
        },
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    // Jika produk sudah kadaluarsa, tandai isExpired = true
    if (product.expired && new Date(product.expired) < new Date()) {
      await prisma.product.update({
        where: { id },
        data: { isExpired: true },
      });
      product.isExpired = true;
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Add Product (for logged-in Merchant)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, expired } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({
        success: false,
        error: 'Fields name, price, and stock are required',
      });
    }

    // Pastikan hanya merchant yang bisa menambah produk
    if (!req.merchant || !req.merchant.merchantId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized — only merchant can add product',
      });
    }

    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { id: req.merchant.merchantId },
    });

    if (!merchantProfile) {
      return res.status(404).json({
        success: false,
        error: 'Merchant profile not found',
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        expired: expired ? new Date(expired) : null,
        isExpired: expired ? new Date(expired) < new Date() : false,
        merchantId: merchantProfile.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        expired: true,
        isExpired: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Update Product (by Merchant)
exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, stock, expired } = req.body;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid product ID' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    // Validasi kepemilikan produk oleh merchant
    if (
      req.merchant &&
      req.merchant.merchantId !== existingProduct.merchantId
    ) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this product',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        expired: expired ? new Date(expired) : existingProduct.expired,
        isExpired: expired
          ? new Date(expired) < new Date()
          : existingProduct.isExpired,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    // Validasi kepemilikan produk oleh merchant
    if (req.merchant && req.merchant.merchantId !== product.merchantId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this product',
      });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
