import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../../../common/enums';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;
}

export class DocumentResponseDto {
  id: string;
  eventId: string;
  documentType: DocumentType;
  originalFileName: string;
  storedFileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedById: string | null;
  uploadedAt: Date;
  active: boolean;
}