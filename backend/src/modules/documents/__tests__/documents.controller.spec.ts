import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: jest.Mocked<DocumentsService>;

  const mockDocument = {
    id: 'doc-123',
    eventId: 'event-123',
    documentType: 'PURCHASE_ORDER' as const,
    originalFileName: 'orden_compra.pdf',
    storedFileName: 'abc123.pdf',
    storagePath: '/uploads/abc123.pdf',
    mimeType: 'application/pdf',
    fileSize: 102400,
    uploadedById: 'user-1',
    uploadedAt: new Date(),
    active: true,
  };

  beforeEach(async () => {
    const mockDocumentsService = {
      upload: jest.fn(),
      findAllByEvent: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: mockDocumentsService }],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a document', async () => {
      const mockFile = { originalname: 'test.pdf', mimetype: 'application/pdf', size: 1024 } as Express.Multer.File;
      const createDto = { documentType: 'PURCHASE_ORDER' };
      service.upload.mockResolvedValue(mockDocument);

      const result = await controller.upload('event-123', mockFile, createDto, 'user-1');

      expect(result).toEqual(mockDocument);
      expect(service.upload).toHaveBeenCalledWith('event-123', mockFile, createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return documents for event', async () => {
      service.findAllByEvent.mockResolvedValue([mockDocument]);

      const result = await controller.findAll('event-123');

      expect(result).toEqual([mockDocument]);
    });
  });

  describe('download', () => {
    it('should return file for download', async () => {
      const mockFilePath = { filePath: '/uploads/test.pdf', originalFileName: 'test.pdf', mimeType: 'application/pdf' };
      service.download.mockResolvedValue(mockFilePath);

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.download('event-123', 'doc-123', mockRes as any);

      expect(service.download).toHaveBeenCalledWith('event-123', 'doc-123');
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      service.remove.mockResolvedValue({ ...mockDocument, active: false });

      const result = await controller.remove('event-123', 'doc-123');

      expect(result.active).toBe(false);
    });
  });
});