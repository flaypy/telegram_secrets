import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { getPushinPayService, PushinPayService } from '../services/pushinpay';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/payments/initiate-payment
 * Initiate a PIX payment with PushinPay
 * Protected route - requires authentication
 *
 * Returns: PIX QR code and copy-paste code for payment
 */
router.post(
  '/initiate-payment',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { priceId } = req.body;
      const userId = req.user?.userId;

      if (!priceId) {
        return res.status(400).json({ error: 'priceId is required' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Get price details
      const price = await prisma.price.findUnique({
        where: { id: priceId },
        include: {
          product: true,
        },
      });

      if (!price) {
        return res.status(404).json({ error: 'Price not found' });
      }

      if (!price.product.isActive) {
        return res.status(400).json({ error: 'Product is not available' });
      }

      // Create pending order
      const order = await prisma.order.create({
        data: {
          userId,
          priceId,
          status: 'PENDING',
        },
      });

      // Convert price amount to cents
      const amountInCents = PushinPayService.toCents(price.amount);

      // Create webhook URL with order ID
      const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/webhook`;

      // Initialize PushinPay service
      const pushinpay = getPushinPayService();

      // Create PIX payment with PushinPay (expires in 30 minutes)
      const pixPayment = await pushinpay.createPixPayment(
        amountInCents,
        webhookUrl,
        30 // Expires in 30 minutes
      );

      // Store PushinPay transaction ID in order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          pushinpayTxId: pixPayment.id,
        },
      });

      console.log('Payment response data:', {
        hasQrCode: !!pixPayment.qr_code,
        hasQrCodeBase64: !!pixPayment.qr_code_base64,
        qrCodeBase64Length: pixPayment.qr_code_base64?.length,
        qrCodeBase64Preview: pixPayment.qr_code_base64?.substring(0, 50),
      });

      res.json({
        success: true,
        orderId: order.id,
        pushinpayTransactionId: pixPayment.id,
        pixCode: pixPayment.qr_code, // Copy-paste PIX code
        pixQrCodeBase64: pixPayment.qr_code_base64, // QR code image
        amount: PushinPayService.formatCurrency(amountInCents),
        amountInCents: pixPayment.value,
        status: pixPayment.status,
        expiresAt: pixPayment.expires_at,
        productName: price.product.name,
        priceCategory: price.category,
      });
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      res.status(500).json({
        error: 'Failed to initiate payment',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/payments/webhook
 * Webhook endpoint for PushinPay payment notifications
 * This endpoint should be registered in your PushinPay dashboard
 *
 * PushinPay will call this endpoint when payment status changes
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log('Received PushinPay webhook:', req.body);

    const pushinpay = getPushinPayService();
    const webhookData = pushinpay.parseWebhookPayload(req.body);

    // Find order by PushinPay transaction ID
    const order = await prisma.order.findFirst({
      where: {
        pushinpayTxId: webhookData.id,
      },
      include: {
        price: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error('Order not found for transaction:', webhookData.id);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order based on payment status
    if (webhookData.status === 'paid') {
      // Payment successful - use the delivery link from the price tier
      const downloadLink = order.price.deliveryLink;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          downloadLink,
        },
      });

      console.log(
        `Order ${order.id} completed. Download link: ${downloadLink}`
      );

      // TODO: Send email to customer with download link
    } else if (webhookData.status === 'expired') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });

      console.log(`Order ${order.id} expired`);
    }

    // Return 200 OK to acknowledge receipt
    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Get order status and details
 * Protected route - requires authentication
 */
router.get(
  '/order/:orderId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const userId = req.user?.userId;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          price: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Ensure user owns this order (or is admin)
      if (order.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ order });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/payments/check-status/:transactionId
 * Check PushinPay transaction status
 * Protected route - requires authentication
 *
 * NOTE: Use sparingly - limited to once per minute by PushinPay
 */
router.get(
  '/check-status/:transactionId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;

      const pushinpay = getPushinPayService();
      const status = await pushinpay.getTransactionStatus(transactionId);

      res.json({
        success: true,
        transaction: status,
      });
    } catch (error: any) {
      console.error('Status check error:', error);
      res.status(500).json({
        error: 'Failed to check payment status',
        message: error.message,
      });
    }
  }
);

export default router;
