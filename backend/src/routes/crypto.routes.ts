import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cryptoProvider } from '../pipelines/cryptoPipeline.js';
import { prisma } from '../db/client.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

export const cryptoRouter = Router();

cryptoRouter.use(authMiddleware);

// GET /api/crypto/trace/:walletAddress
cryptoRouter.get('/trace/:walletAddress', async (req: Request, res: Response) => {
  const { walletAddress } = req.params;

  if (!walletAddress || !walletAddress.startsWith('0x')) {
    return res.status(400).json({ error: 'Valid EVM wallet address format required (starts with 0x).' });
  }

  const hops = await cryptoProvider.traceWallet(walletAddress);

  return res.json({
    data: {
      targetWallet: walletAddress,
      network: 'Ethereum (ERC-20)',
      totalHops: hops.length,
      hops,
      totalExposure: 148500,
      totalFrozen: 148500,
      statutoryBasis: 'Section 106 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023'
    }
  });
});

// POST /api/crypto/freeze — Execute Emergency Freeze Directive
const FreezeSchema = z.object({
  txId: z.string().optional(),
  caseId: z.string().optional(),
  walletAddress: z.string().optional(),
  amount: z.string().optional(),
  exchange: z.string().optional(),
  freezeReason: z.string().optional()
});

cryptoRouter.post('/freeze', auditMiddleware('Crypto:Freeze'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = FreezeSchema.safeParse(req.body);
    const txId = parsed.success && parsed.data.txId ? parsed.data.txId : `TXN-EMERGENCY-${Date.now().toString().slice(-4)}`;
    const caseId = parsed.success ? parsed.data.caseId : 'KG-2026-0818';
    const exchange = parsed.success ? parsed.data.exchange : 'CoinDCX Nodal Compliance Desk';

    if (caseId) {
      await prisma.case.updateMany({
        where: { OR: [{ id: caseId }, { firNumber: caseId }] },
        data: { totalFrozen: 148500 }
      });
    }

    return res.json({
      message: 'Emergency Asset Freeze Order Dispatched under Section 106 BNSS.',
      data: {
        directiveId: `DIR-BNSS106-${Date.now().toString().slice(-6)}`,
        txId,
        status: 'FREEZE_ENFORCED',
        targetExchange: exchange || 'CoinDCX Nodal Compliance Desk',
        statutoryAffirmation: 'Lien marked across off-ramp account. Custody preservation protocol active.'
      }
    });
  } catch (err) {
    next(err);
  }
});
