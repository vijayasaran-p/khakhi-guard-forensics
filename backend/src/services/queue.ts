import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger/index.js';

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  timestamp: number;
}

export type JobHandler<T = any, R = any> = (job: Job<T>) => Promise<R>;

export interface IQueueService {
  addJob<T>(queueName: string, data: T): Promise<{ jobId: string }>;
  registerWorker<T>(queueName: string, handler: JobHandler<T>): void;
}

class InProcessQueueService implements IQueueService {
  private workers: Map<string, JobHandler> = new Map();

  constructor() {
    logger.info('Initialized In-Process Background Job Queue Service');
  }

  async addJob<T>(queueName: string, data: T): Promise<{ jobId: string }> {
    const jobId = `job_${uuidv4().substring(0, 8)}`;
    const job: Job<T> = {
      id: jobId,
      name: queueName,
      data,
      timestamp: Date.now()
    };

    logger.info(`Job enqueued: [${queueName}]`, { jobId });

    // Execute asynchronously on next event loop tick to simulate real queue worker
    setImmediate(async () => {
      const handler = this.workers.get(queueName);
      if (!handler) {
        logger.warn(`No registered worker for queue: [${queueName}]. Job ${jobId} deferred.`);
        return;
      }
      try {
        logger.info(`Worker processing job: [${queueName}] #${jobId}`);
        await handler(job);
        logger.info(`Job completed successfully: [${queueName}] #${jobId}`);
      } catch (err: any) {
        logger.error(`Job execution failed: [${queueName}] #${jobId}`, { error: err.message, stack: err.stack });
      }
    });

    return { jobId };
  }

  registerWorker<T>(queueName: string, handler: JobHandler<T>): void {
    this.workers.set(queueName, handler);
    logger.info(`Registered background worker for queue: [${queueName}]`);
  }
}

export const queueService: IQueueService = new InProcessQueueService();
