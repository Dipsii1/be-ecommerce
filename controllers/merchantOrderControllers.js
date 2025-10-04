const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//  Get all orders related to the merchant’s products
exports.getMerchantOrders = async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;

    // Find all orders that contain products owned by this merchant
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              merchantId: merchantId,
            },
          },
        },
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, username: true, email: true } },
        items: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No orders found for this merchant.',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully.',
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant orders.',
      detail: error.message,
    });
  }
};

// Get specific order details for merchant
exports.getMerchantOrderDetail = async (req, res) => {
  try {
    const merchantId = req.merchant.merchantId;
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, username: true, email: true } },
        items: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                merchantId: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
      });
    }

    // Check if the order contains at least one product owned by this merchant
    const ownsProduct = order.items.some(
      (item) => item.product.merchantId === merchantId
    );
    if (!ownsProduct) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this order.',
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
