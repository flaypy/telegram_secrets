import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import {
  initiatePushinPayPayment,
  checkPaymentStatus,
  verifyWebhookSignature,
  generateDownloadLink,
} from '../services/pushinpay';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/payments/initiate-payment
 * Initiate a payment with PushinPay
 * Protected route - requires authentication
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

      // Initiate payment with PushinPay
      // TODO: Replace with actual PushinPay integration
      const paymentResponse = await initiatePushinPayPayment({
        priceId: price.id,
        amount: price.amount,
        currency: price.currency,
        userId,
        productName: price.product.name,
      });

      if (!paymentResponse.success) {
        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED' },
        });

        return res.status(500).json({
          error: 'Failed to initiate payment',
          details: paymentResponse.error,
        });
      }

      res.json({
        message: 'Payment initiated successfully',
        orderId: order.id,
        paymentId: paymentResponse.paymentId,
        paymentUrl: paymentResponse.paymentUrl,
        amount: price.amount,
        currency: price.currency,
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/payments/webhook
 * Webhook endpoint for PushinPay payment notifications
 * This endpoint should be registered in your PushinPay dashboard
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-pushinpay-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    // TODO: Implement actual signature verification
    const isValid = verifyWebhookSignature(payload, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { orderId, status, transactionId } = req.body;

    // Find order
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

    // Update order based on payment status
    if (status === 'completed') {
      // Generate download link
      const downloadLink = generateDownloadLink(
        order.id,
        order.price.product.id
      );

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          downloadLink,
        },
      });

      // TODO: Send email to customer with download link
      console.log(`Order ${orderId} completed. Download link: ${downloadLink}`);
    } else if (status === 'failed') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Get order status
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

export default router;
