import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../db/client.js';
import { logger } from '../logger/index.js';

export interface AuthUser {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  role: 'INVESTIGATOR' | 'ANALYST' | 'SUPERVISOR' | 'ADMIN';
  jurisdiction: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In demo mode, if no auth header is provided, provide a default fallback investigator identity
      if (config.demoMode) {
        req.user = {
          id: 'demo-investigator-01',
          name: 'SP Amrita Sehgal',
          badgeNumber: 'CH-IPS-2024-092',
          email: 'officer.sehgal@chd.police.gov.in',
          role: 'SUPERVISOR',
          jurisdiction: 'Chandigarh UT'
        };
        return next();
      }
      return res.status(401).json({ error: 'Authentication required. Bearer token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, badgeNumber: true, email: true, role: true, jurisdiction: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    req.user = user as AuthUser;
    next();
  } catch (err: any) {
    logger.warn('Invalid or expired authentication token', { error: err.message, correlationId: req.correlationId });
    return res.status(401).json({ error: 'Invalid or expired session token. Please re-authenticate.' });
  }
}

export function requireRole(allowedRoles: Array<'INVESTIGATOR' | 'ANALYST' | 'SUPERVISOR' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt by role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        correlationId: req.correlationId
      });
      return res.status(403).json({
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] statutory roles. Your role is ${req.user.role}.`
      });
    }
    next();
  };
}
