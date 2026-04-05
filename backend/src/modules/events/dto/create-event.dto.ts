import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, IsDateString, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType, EventStatus } from '../../../common/enums';

export class CreateEventDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 'Cumpleaños de María' })
  @IsString()
  name: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  eventTime?: string;

  @ApiPropertyOptional({ example: 'Casa de la celebración' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'Menú completo con entrée, plato principal y postre' })
  @IsOptional()
  @IsString()
  serviceDetails?: string;

  @ApiPropertyOptional({ example: 'Cliente VIP' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  saleId?: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: 'Cumpleaños de María' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({ example: '2024-06-15' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  eventTime?: string;

  @ApiPropertyOptional({ example: 'Casa de la celebración' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'Menú completo con entrée, plato principal y postre' })
  @IsOptional()
  @IsString()
  serviceDetails?: string;

  @ApiPropertyOptional({ example: 'Cliente VIP' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  saleId?: string;
}

export class UpdateEventStatusDto {
  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;
}