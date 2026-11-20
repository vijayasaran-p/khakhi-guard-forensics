import { Router, Request, Response } from 'express';
import multer from 'multer';
import { prisma } from '../db/client.js';
import { storage } from '../services/storage.js';
import { queueService } from '../services/queue.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

export const evidenceRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

evidenceRouter.use(authMiddleware);

// Helper to resolve or create fallback active case
async function resolveCaseId(caseId?: string): Promise<string> {
  if (caseId) {
    const existing = await prisma.case.findFirst({
      where: { OR: [{ id: caseId }, { firNumber: caseId }] }
    });
    if (existing) return existing.id;
  }

  // Get or create primary active demo case
  let defaultCase = await prisma.case.findFirst({
    where: { firNumber: 'KG-2026-0818' }
  });

  if (!defaultCase) {
    defaultCase = await prisma.case.create({
      data: {
        firNumber: 'KG-2026-0818',
        title: 'Tri-City Coordinated Extortion & Cyber Fraud Nexus',
        policeStation: 'Sector 17 Crime Branch, Chandigarh',
        priority: 'CRITICAL',
        financialExposure: 148500,
        complainantName: 'Sunil Verma',
        accusedName: 'Vikram Singh'
      }
    });
  }

  return defaultCase.id;
}

// POST /api/evidence/fir — Upload & Enqueue FIR Document
evidenceRouter.post(
  '/fir',
  upload.single('file'),
  auditMiddleware('Evidence:FIR'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No evidence file provided in multipart payload.' });
    }

    const caseId = await resolveCaseId(req.body.caseId);
    const saveResult = await storage.saveFile(req.file, 'evidence/fir');

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        evidenceType: 'FIR_PDF',
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype || 'application/pdf',
        storagePath: saveResult.storagePath,
        fileSizeBytes: saveResult.sizeBytes,
        sha256Hash: saveResult.sha256,
        processingStatus: 'PENDING',
        uploaderId: req.user?.id
      }
    });

    // Enqueue background processing job
    const { jobId } = await queueService.addJob('FIR_PROCESS_JOB', {
      evidenceId: evidence.id,
      caseId
    });

    return res.status(202).json({
      message: 'Evidence successfully ingested. Automated entity extraction initiated.',
      data: evidence,
      jobId
    });
  }
);

// POST /api/evidence/cdr — Upload & Enqueue Telecom CDR CSV
evidenceRouter.post(
  '/cdr',
  upload.single('file'),
  auditMiddleware('Evidence:CDR'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No CDR file provided in multipart payload.' });
    }

    const caseId = await resolveCaseId(req.body.caseId);
    const saveResult = await storage.saveFile(req.file, 'evidence/cdr');

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        evidenceType: 'CDR_CSV',
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype || 'text/csv',
        storagePath: saveResult.storagePath,
        fileSizeBytes: saveResult.sizeBytes,
        sha256Hash: saveResult.sha256,
        processingStatus: 'PENDING',
        uploaderId: req.user?.id
      }
    });

    const { jobId } = await queueService.addJob('CDR_PROCESS_JOB', {
      evidenceId: evidence.id,
      caseId
    });

    return res.status(202).json({
      message: 'Carrier CDR evidence successfully ingested into lawful intercept processing pipeline.',
      data: evidence,
      jobId
    });
  }
);

// POST /api/evidence/media — Upload & Enqueue Video/Audio
evidenceRouter.post(
  '/media',
  upload.single('file'),
  auditMiddleware('Evidence:Media'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided.' });
    }

    const isAudio = req.file.mimetype.startsWith('audio/') || ['.mp3', '.wav', '.m4a'].some(ext => req.file?.originalname.toLowerCase().endsWith(ext));
    const evidenceType = isAudio ? 'MEDIA_AUDIO' : 'MEDIA_VIDEO';

    const caseId = await resolveCaseId(req.body.caseId);
    const saveResult = await storage.saveFile(req.file, 'evidence/media');

    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        evidenceType,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        storagePath: saveResult.storagePath,
        fileSizeBytes: saveResult.sizeBytes,
        sha256Hash: saveResult.sha256,
        processingStatus: 'PENDING',
        uploaderId: req.user?.id
      }
    });

    const { jobId } = await queueService.addJob('MEDIA_PROCESS_JOB', {
      evidenceId: evidence.id,
      caseId
    });

    return res.status(202).json({
      message: 'Media evidence queued for BSA Section 63B spectral & biometric tampering analysis.',
      data: evidence,
      jobId
    });
  }
);

// GET /api/evidence/:id — Status check
evidenceRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: {
      cdrRows: { take: 15 },
      mediaFindings: true
    }
  });

  if (!evidence) {
    return res.status(404).json({ error: 'Evidence record not found.' });
  }

  return res.json({ data: evidence });
});
