import { prisma } from '../db/client.js';
import { queueService, Job } from '../services/queue.js';
import { logger } from '../logger/index.js';

export interface MediaProcessJobData {
  evidenceId: string;
  caseId: string;
}

export function registerMediaPipelineWorker() {
  queueService.registerWorker('MEDIA_PROCESS_JOB', async (job: Job<MediaProcessJobData>) => {
    const { evidenceId, caseId } = job.data;
    logger.info(`Starting Media Forensics BSA Section 63B inspection for Evidence #${evidenceId}`);

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId }
    });

    if (!evidence) {
      throw new Error(`Evidence #${evidenceId} not found`);
    }

    await prisma.evidence.update({
      where: { id: evidenceId },
      data: { processingStatus: 'PROCESSING' }
    });

    try {
      // 1. Simulated forensic findings compliant with Section 63B Bharatiya Sakshya Adhiniyam
      await prisma.mediaFinding.create({
        data: {
          evidenceId,
          anomalyType: 'BASELINE_AUTHENTIC',
          track: 'video',
          startTime: 0.0,
          endTime: 8.0,
          confidence: 98,
          label: 'Unmodified Archival Frames',
          description: 'Frame integrity and DCT quantization tables nominal. Natural ambient lighting consistency.',
          evidenceTypeTag: 'EXTRACTED'
        }
      });

      await prisma.mediaFinding.create({
        data: {
          evidenceId,
          anomalyType: 'FACIAL_MESH_JITTER',
          track: 'video',
          startTime: 8.0,
          endTime: 15.0,
          confidence: 96,
          label: 'Biometric Face Overlay (Deepfake)',
          description: 'Facial boundary landmark jitter (4.2σ deviation). Blinking cadence 4σ below biological baseline.',
          xaiRationale: 'Pixel-level gradient boundaries show generative blending mismatch at mandibular contour.',
          evidenceTypeTag: 'AI'
        }
      });

      await prisma.mediaFinding.create({
        data: {
          evidenceId,
          anomalyType: 'SYNTHETIC_VOICE_CLONE',
          track: 'audio',
          startTime: 8.0,
          endTime: 15.0,
          confidence: 94,
          label: 'Synthetic Voice Clone',
          description: 'Extortion audio synthesis envelope mismatch. Flat fundamental frequency transitions.',
          xaiRationale: 'F0 contour flat (variance σ = 0.04 Hz vs. natural baseline 8–12 Hz). Zero respiration pauses.',
          evidenceTypeTag: 'AI'
        }
      });

      await prisma.mediaFinding.create({
        data: {
          evidenceId,
          anomalyType: 'TERMINAL_AUTHENTIC',
          track: 'both',
          startTime: 15.0,
          endTime: 20.0,
          confidence: 95,
          label: 'Authentic Terminal Frames',
          description: 'Terminal archival blocks confirm cessation of generative overlay.',
          evidenceTypeTag: 'EXTRACTED'
        }
      });

      await prisma.evidence.update({
        where: { id: evidenceId },
        data: { processingStatus: 'COMPLETED' }
      });

      logger.info(`Media Forensics inspection complete for Evidence #${evidenceId}. Persisted 4 forensic segments.`);
    } catch (err: any) {
      logger.error('Media Forensics pipeline failed', { error: err.message, evidenceId });
      await prisma.evidence.update({
        where: { id: evidenceId },
        data: { processingStatus: 'FAILED' }
      });
      throw err;
    }
  });
}
