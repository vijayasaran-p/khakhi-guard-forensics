import { Router, Request, Response } from 'express';
import fs from 'fs';
import { generateCaseDossierPdf } from '../services/dossierService.js';
import { storage } from '../services/storage.js';
import { prisma } from '../db/client.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

export const dossierRouter = Router();

dossierRouter.use(authMiddleware);

// POST /api/cases/:id/dossier/generate or /api/dossier/:id/generate
const handleGenerate = async (req: Request, res: Response) => {
  const { id } = req.params;

  let targetId = id;
  const existing = await prisma.case.findFirst({
    where: { OR: [{ id }, { firNumber: id }] }
  });

  if (existing) {
    targetId = existing.id;
  } else {
    const defaultCase = await prisma.case.findFirst({
      where: { firNumber: 'KG-2026-0818' }
    });
    if (defaultCase) targetId = defaultCase.id;
  }

  const officerName = req.user?.name || 'SP Amrita Sehgal';
  const result = await generateCaseDossierPdf(targetId, officerName);

  return res.json({
    message: 'Court-admissible electronic evidence docket generated under Section 63 BSA.',
    data: {
      storagePath: result.storagePath,
      sha256: result.sha256,
      sizeBytes: result.sizeBytes,
      downloadUrl: `/api/cases/${targetId}/dossier/download?path=${encodeURIComponent(result.storagePath)}`
    }
  });
};

const handleDownload = async (req: Request, res: Response) => {
  const { path: queryPath } = req.query;

  let relativePath = queryPath as string;
  if (!relativePath) {
    const targetId = req.params.id;
    const result = await generateCaseDossierPdf(targetId, req.user?.name || 'SP Amrita Sehgal');
    relativePath = result.storagePath;
  }

  const fullPath = storage.getFilePath(relativePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Requested dossier document not found on file storage.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Statutory_Dossier_${Date.now()}.pdf"`);
  fs.createReadStream(fullPath).pipe(res);
};

dossierRouter.post('/:id/dossier/generate', auditMiddleware('Dossier:Generate'), handleGenerate);
dossierRouter.post('/:id/generate', auditMiddleware('Dossier:Generate'), handleGenerate);
dossierRouter.get('/:id/dossier/download', handleDownload);
dossierRouter.get('/:id/download', handleDownload);

