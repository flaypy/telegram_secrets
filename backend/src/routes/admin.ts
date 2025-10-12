import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and admin middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/products
 * Get all products (no filtering)
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: true,
        regions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/products
 * Create a new product
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, isActive, prices } = req.body;

    // Validation
    if (!name || !description || !imageUrl) {
      return res.status(400).json({
        error: 'Name, description, and imageUrl are required',
      });
    }

    // Create product with optional prices
    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
        prices: prices
          ? {
              create: prices.map((price: any) => ({
                amount: price.amount,
                currency: price.currency,
                category: price.category,
              })),
            }
          : undefined,
      },
      include: {
        prices: true,
        regions: true,
      },
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update a product
 */
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isActive } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description: description || existingProduct.description,
        imageUrl: imageUrl || existingProduct.imageUrl,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
      },
      include: {
        prices: true,
        regions: true,
      },
    });

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product
 */
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete product (cascade will delete related prices and regions)
    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/products/regions
 * Associate a product with a country region
 */
router.post('/products/regions', async (req: Request, res: Response) => {
  try {
    const { productId, countryCode } = req.body;

    // Validation
    if (!productId || !countryCode) {
      return res.status(400).json({
        error: 'productId and countryCode are required',
      });
    }

    // Validate country code format (should be 2 letters)
    if (!/^[A-Z]{2}$/i.test(countryCode)) {
      return res.status(400).json({
        error: 'countryCode must be a 2-letter ISO code (e.g., BR, US, ES)',
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or update region association
    const region = await prisma.productRegion.upsert({
      where: {
        productId_countryCode: {
          productId,
          countryCode: countryCode.toUpperCase(),
        },
      },
      create: {
        productId,
        countryCode: countryCode.toUpperCase(),
      },
      update: {},
    });

    res.status(201).json({
      message: 'Product region association created',
      region,
    });
  } catch (error) {
    console.error('Error creating product region:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/products/regions/:id
 * Remove a product region association
 */
router.delete('/products/regions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.productRegion.delete({
      where: { id },
    });

    res.json({ message: 'Product region association deleted' });
  } catch (error) {
    console.error('Error deleting product region:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/orders
 * Get all orders
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        price: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
