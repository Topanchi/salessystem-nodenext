import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, Res, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('documents')
@Controller('api/v1/events/:eventId/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document to event' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async upload(
    @Param('eventId') eventId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'application/pdf' })
        .addMaxSizeValidator({ maxSize: 10485760 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    ) file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.upload(eventId, file, createDocumentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for event' })
  @ApiResponse({ status: 200, description: 'Documents returned' })
  async findAll(@Param('eventId') eventId: string) {
    return this.documentsService.findAllByEvent(eventId);
  }

  @Get(':documentId/download')
  @ApiOperation({ summary: 'Download document' })
  @ApiResponse({ status: 200, description: 'File downloaded' })
  async download(
    @Param('eventId') eventId: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const { filePath, originalFileName, mimeType } = await this.documentsService.download(eventId, documentId);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async remove(@Param('eventId') eventId: string, @Param('documentId') documentId: string) {
    return this.documentsService.remove(eventId, documentId);
  }
}