import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/settings/public
 * Get public settings (like support contact)
 * Public route - no authentication required
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const supportContact = await prisma.setting.findUnique({
      where: { key: 'support_telegram' },
    });

    const paymentGatewayConfig = await prisma.setting.findUnique({
      where: { key: 'payment_gateway' },
    });

    const blackFridayPromo = await prisma.setting.findUnique({
      where: { key: 'black_friday_promo' },
    });

    res.json({
      supportTelegram: supportContact?.value || '',
      paymentGateway: paymentGatewayConfig?.value || 'pushinpay',
      blackFridayPromo: blackFridayPromo?.value === 'true',
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/settings
 * Get all settings
 * Protected route - requires admin authentication
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const settings = await prisma.setting.findMany();

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/:key
 * Update or create a setting
 * Protected route - requires admin authentication
 */
router.put('/:key', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
