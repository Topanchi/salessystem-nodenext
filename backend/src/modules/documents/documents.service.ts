import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalStorageService } from '../../storage/storage.service';
import { CreateDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storageService: LocalStorageService,
  ) {}

  async upload(eventId: string, file: Express.Multer.File, createDocumentDto: CreateDocumentDto, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const existingDocument = await this.prisma.eventDocument.findFirst({
      where: {
        eventId,
        documentType: createDocumentDto.documentType,
        active: true,
      },
    });

    if (existingDocument) {
      await this.storageService.delete(existingDocument.storedFileName);
      await this.prisma.eventDocument.update({
        where: { id: existingDocument.id },
        data: { active: false },
      });
    }

    const storageResult = await this.storageService.upload(file);

    return this.prisma.eventDocument.create({
      data: {
        eventId,
        documentType: createDocumentDto.documentType,
        originalFileName: file.originalname,
        storedFileName: storageResult.storedFileName,
        storagePath: storageResult.storagePath,
        mimeType: storageResult.mimeType,
        fileSize: storageResult.fileSize,
        uploadedById: userId,
      },
    });
  }

  async findAllByEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.eventDocument.findMany({
      where: { eventId, active: true },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async download(eventId: string, documentId: string) {
    const document = await this.prisma.eventDocument.findFirst({
      where: { id: documentId, eventId, active: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = this.storageService.getFilePath(document.storedFileName);
    
    return {
      filePath,
      originalFileName: document.originalFileName,
      mimeType: document.mimeType,
    };
  }

  async remove(eventId: string, documentId: string) {
    const document = await this.prisma.eventDocument.findFirst({
      where: { id: documentId, eventId, active: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.storageService.delete(document.storedFileName);

    return this.prisma.eventDocument.update({
      where: { id: documentId },
      data: { active: false },
    });
  }
}