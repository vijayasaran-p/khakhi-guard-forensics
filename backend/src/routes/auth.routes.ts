import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { config } from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid statutory credentials.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid statutory credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, badgeNumber: user.badgeNumber },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as any
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      badgeNumber: user.badgeNumber,
      email: user.email,
      role: user.role,
      jurisdiction: user.jurisdiction
    }
  });
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  return res.json({ user: req.user });
});
