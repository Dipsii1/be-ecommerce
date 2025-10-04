const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//  Checkout — Create a new order from user's cart
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Your cart is empty.',
      });
    }

    // Calculate total and check product availability
    let total = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${item.product.name}.`,
        });
      }

      if (
        item.product.isExpired ||
        (item.product.expired && new Date(item.product.expired) < new Date())
      ) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product.name} is expired and cannot be ordered.`,
        });
      }

      const itemTotal = item.quantity * item.product.price;
      total += itemTotal;

      orderItemsData.push({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: { create: orderItemsData },
      },
      include: {
        items: {
          include: { product: { select: { name: true, price: true } } },
        },
      },
    });

    // Decrease stock for ordered products
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: item.product.stock - item.quantity },
      });
    }

    // Clear cart after checkout
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create order.',
      detail: error.message,
    });
  }
};

//  Get all orders (user’s order history)
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            product: { select: { name: true, price: true } },
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Order history retrieved successfully.',
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order history.',
      detail: error.message,
    });
  }
};

//  Get specific order detail (for user)
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: { select: { name: true, price: true } } },
        },
      },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not accessible.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details.',
      detail: error.message,
    });
  }
};
