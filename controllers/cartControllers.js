const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all cart items for current user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, data: [], message: 'Cart is empty' });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: 'Failed to get cart',
        detail: error.message,
      });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity)
      return res
        .status(400)
        .json({ success: false, error: 'productId and quantity are required' });

    // cek produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });

    if (
      product.isExpired ||
      (product.expired && new Date(product.expired) < new Date())
    )
      return res
        .status(400)
        .json({ success: false, error: 'Product already expired' });

    // cari cart user
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // cek jika produk sudah ada di cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) },
      });
      return res.json({
        success: true,
        message: 'Cart updated',
        data: updated,
      });
    }

    const newItem = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: parseInt(quantity) },
    });

    res
      .status(201)
      .json({ success: true, message: 'Added to cart', data: newItem });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: 'Failed to add to cart',
        detail: error.message,
      });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) },
    });

    res.json({ success: true, message: 'Cart item updated', data: updated });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: 'Failed to update cart item',
        detail: error.message,
      });
  }
};

// Remove single item
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: 'Failed to remove item',
        detail: error.message,
      });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart)
      return res.status(404).json({ success: false, error: 'Cart not found' });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: 'Failed to clear cart',
        detail: error.message,
      });
  }
};
