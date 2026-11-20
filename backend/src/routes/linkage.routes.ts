import { Router, Request, Response } from 'express';
import { generateLinkageGraphAndRisk } from '../services/riskEngine.js';
import { prisma } from '../db/client.js';
import { authMiddleware } from '../middleware/auth.js';

export const linkageRouter = Router();

linkageRouter.use(authMiddleware);

// GET /api/linkage/:caseId
linkageRouter.get('/:caseId', async (req: Request, res: Response) => {
  const { caseId } = req.params;

  // Resolve case ID or use primary case
  let targetId = caseId;
  const existing = await prisma.case.findFirst({
    where: { OR: [{ id: caseId }, { firNumber: caseId }] }
  });

  if (existing) {
    targetId = existing.id;
  } else {
    const defaultCase = await prisma.case.findFirst({
      where: { firNumber: 'KG-2026-0818' }
    });
    if (defaultCase) targetId = defaultCase.id;
  }

  const result = await generateLinkageGraphAndRisk(targetId);

  return res.json({ data: result });
});
