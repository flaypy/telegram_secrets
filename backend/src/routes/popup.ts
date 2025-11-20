import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/popup
 * Public route to get active popup configuration
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get the first active popup config
    const popup = await prisma.popupConfig.findFirst({
      where: {
        isActive: true,
      },
    });

    res.json({ popup });
  } catch (error) {
    console.error('Error fetching popup config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
