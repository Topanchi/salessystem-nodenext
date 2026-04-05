export interface StorageResult {
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
}

export interface IStorageService {
  upload(file: Express.Multer.File): Promise<StorageResult>;
  delete(storedFileName: string): Promise<void>;
  getFilePath(storedFileName: string): string;
}