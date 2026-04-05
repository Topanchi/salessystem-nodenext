import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto, UpdateSaleStatusDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SaleStatus } from '../../common/enums';

@ApiTags('sales')
@Controller('api/v1/sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created' })
  async create(@Body() createSaleDto: CreateSaleDto, @CurrentUser('id') userId: string) {
    return this.salesService.create(createSaleDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: SaleStatus })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiQuery({ name: 'sellerId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: SaleStatus,
    @Query('clientId') clientId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.findAll(page || 1, limit || 10, status, clientId, sellerId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale returned' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200, description: 'Sale updated' })
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.salesService.update(id, updateSaleDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sale status' })
  @ApiResponse({ status: 200, description: 'Sale status updated' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateSaleStatusDto) {
    return this.salesService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel sale' })
  @ApiResponse({ status: 200, description: 'Sale cancelled' })
  async remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}