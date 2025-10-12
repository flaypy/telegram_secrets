import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/products
 * Public route to list products filtered by geolocation
 * Products are only shown if:
 * 1. They have no region restrictions (global), OR
 * 2. They have a region restriction matching the user's country
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userCountryCode = req.geo?.countryCode;

    // Get all active products with their regions and prices
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        prices: true,
        regions: true,
      },
    });

    // Filter products based on geolocation
    const filteredProducts = products.filter((product) => {
      // If product has no region restrictions, show it globally
      if (product.regions.length === 0) {
        return true;
      }

      // If product has region restrictions, check if user's country matches
      if (userCountryCode) {
        return product.regions.some(
          (region) => region.countryCode === userCountryCode
        );
      }

      // If we can't determine user's location, don't show region-restricted products
      return false;
    });

    // Remove regions from response (internal data)
    const responseProducts = filteredProducts.map(({ regions, ...product }) => ({
      ...product,
      availableInRegion: true,
    }));

    res.json({
      products: responseProducts,
      detectedCountry: userCountryCode,
      totalCount: responseProducts.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id
 * Public route to get a single product's details
 * Includes geolocation check
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userCountryCode = req.geo?.countryCode;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        prices: true,
        regions: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(404).json({ error: 'Product not available' });
    }

    // Check geolocation restrictions
    const hasRegionRestrictions = product.regions.length > 0;
    const isAvailableInRegion =
      !hasRegionRestrictions ||
      (userCountryCode &&
        product.regions.some((region) => region.countryCode === userCountryCode));

    if (!isAvailableInRegion) {
      return res.status(403).json({
        error: 'Product not available in your region',
        detectedCountry: userCountryCode,
      });
    }

    // Remove regions from response
    const { regions, ...productData } = product;

    res.json({
      product: productData,
      detectedCountry: userCountryCode,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
