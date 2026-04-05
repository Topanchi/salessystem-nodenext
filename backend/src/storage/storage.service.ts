import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, StorageResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private storagePath: string;
  private allowedMimeTypes: string[];
  private maxFileSize: number;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get('storage.localPath') || './uploads';
    this.allowedMimeTypes = this.configService.get('storage.allowedMimeTypes') || ['application/pdf'];
    this.maxFileSize = this.configService.get('storage.maxFileSize') || 10485760;
    
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<StorageResult> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    const ext = path.extname(file.originalname);
    const storedFileName = `${uuidv4()}${ext}`;
    const storagePath = path.join(this.storagePath, storedFileName);

    await fs.promises.writeFile(storagePath, file.buffer);

    return {
      storedFileName,
      storagePath,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  async delete(storedFileName: string): Promise<void> {
    const filePath = path.join(this.storagePath, storedFileName);
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getFilePath(storedFileName: string): string {
    return path.join(this.storagePath, storedFileName);
  }
}