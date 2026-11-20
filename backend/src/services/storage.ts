import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { logger } from '../logger/index.js';

export interface StorageResult {
  storagePath: string;
  sha256: string;
  sizeBytes: number;
}

export interface IStorageProvider {
  saveFile(file: Express.Multer.File, subfolder?: string): Promise<StorageResult>;
  saveBuffer(buffer: Buffer, originalFilename: string, subfolder?: string): Promise<StorageResult>;
  getFilePath(storagePath: string): string;
  deleteFile(storagePath: string): Promise<void>;
}

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || config.storageLocalDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, subfolder: string = 'evidence'): Promise<StorageResult> {
    const targetFolder = path.join(this.baseDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const safeFilename = `${Date.now()}_${sha256.substring(0, 12)}_${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destinationPath = path.join(targetFolder, safeFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    logger.info('Evidence file securely persisted to local storage', {
      filename: safeFilename,
      sha256,
      sizeBytes: file.size,
      subfolder
    });

    return {
      storagePath: path.join(subfolder, safeFilename).replace(/\\/g, '/'),
      sha256,
      sizeBytes: file.size
    };
  }

  async saveBuffer(buffer: Buffer, originalFilename: string, subfolder: string = 'dossiers'): Promise<StorageResult> {
    const targetFolder = path.join(this.baseDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const safeFilename = `${Date.now()}_${sha256.substring(0, 12)}_${path.basename(originalFilename).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destinationPath = path.join(targetFolder, safeFilename);

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      storagePath: path.join(subfolder, safeFilename).replace(/\\/g, '/'),
      sha256,
      sizeBytes: buffer.length
    };
  }

  getFilePath(storagePath: string): string {
    return path.join(this.baseDir, storagePath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = this.getFilePath(storagePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

export const storage: IStorageProvider = new LocalStorageProvider();
