import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token
 * Adds user object to request if token is valid
 *
 * Se o token for válido mas o usuário não existir mais no banco,
 * cria automaticamente um novo guest e retorna um novo token via header
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Verifica se o usuário ainda existe no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      // Usuário não existe mais - cria automaticamente um novo guest
      console.log(`⚠️ User ${decoded.userId} not found in database. Creating new guest session...`);

      const guestEmail = `guest_${randomUUID()}@telegram-secrets.com`;
      const newUser = await prisma.user.create({
        data: {
          email: guestEmail,
          role: 'GUEST',
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      // Gera um novo token para o guest
      const newToken = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        secret,
        { expiresIn: '7d' }
      );

      // Adiciona o novo token no header da resposta para o frontend atualizar
      res.setHeader('X-New-Token', newToken);

      // Usa os dados do novo usuário
      req.user = {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      console.log(`✅ New guest session created: ${newUser.id}`);
    } else {
      // Usuário existe - continua normalmente
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to verify user has admin role
 * Must be used after authenticateToken middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
