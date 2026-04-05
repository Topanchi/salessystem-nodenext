import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '../../../common/enums';

export class CreateProductDto {
  @ApiProperty({ example: 'Torta de Chocolate' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ example: 'Deliciosa torta de chocolate con capas de crema' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'Para eventos especiales' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Torta de Chocolate' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ example: 'Deliciosa torta de chocolate con capas de crema' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'Para eventos especiales' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}