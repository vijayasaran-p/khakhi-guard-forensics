import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

export const casesRouter = Router();

casesRouter.use(authMiddleware);

// GET /api/cases — Paginated list with filtering
casesRouter.get('/', async (req: Request, res: Response) => {
  const { search, status, priority, station, page = '1', limit = '10' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const take = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * take;

  const where: any = {};

  if (status && status !== 'All') {
    where.status = status;
  }
  if (priority && priority !== 'All') {
    where.priority = priority;
  }
  if (station && station !== 'All') {
    where.policeStation = { contains: station as string };
  }
  if (search) {
    const q = search as string;
    where.OR = [
      { firNumber: { contains: q } },
      { title: { contains: q } },
      { complainantName: { contains: q } },
      { accusedName: { contains: q } },
      { policeStation: { contains: q } }
    ];
  }

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { entities: true, evidence: true, relationships: true }
        }
      }
    }),
    prisma.case.count({ where })
  ]);

  return res.json({
    data: cases,
    pagination: {
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take)
    }
  });
});

// GET /api/cases/:id — Detailed Case Record
casesRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const caseRecord = await prisma.case.findFirst({
    where: {
      OR: [{ id }, { firNumber: id }]
    },
    include: {
      entities: true,
      evidence: {
        include: {
          cdrRows: { take: 10 },
          mediaFindings: true
        }
      },
      relationships: true,
      transactions: true,
      investigatingOfficer: {
        select: { id: true, name: true, badgeNumber: true, email: true }
      }
    }
  });

  if (!caseRecord) {
    return res.status(404).json({ error: `Case record ${id} not found.` });
  }

  return res.json({ data: caseRecord });
});

// POST /api/cases — Create New Case Docket
const CreateCaseSchema = z.object({
  firNumber: z.string().min(3),
  title: z.string().min(5),
  policeStation: z.string().min(3),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  complainantName: z.string().optional(),
  accusedName: z.string().optional(),
  financialExposure: z.number().default(0),
  summary: z.string().optional()
});

casesRouter.post('/', auditMiddleware('Case'), async (req: Request, res: Response) => {
  const data = CreateCaseSchema.parse(req.body);

  const existing = await prisma.case.findUnique({
    where: { firNumber: data.firNumber }
  });

  if (existing) {
    return res.status(409).json({ error: `Case with FIR number ${data.firNumber} already exists.` });
  }

  const newCase = await prisma.case.create({
    data: {
      ...data,
      investigatingOfficerId: req.user?.id
    }
  });

  return res.status(201).json({ data: newCase });
});
