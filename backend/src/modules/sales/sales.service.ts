import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSaleDto, UpdateSaleDto, SaleItemDto } from './dto';
import { SaleStatus } from '../../../common/enums';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private calculateTotals(items: SaleItemDto[], discountAmount: number = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const total = subtotal - discountAmount;
    return { subtotal, total };
  }

  async create(createSaleDto: CreateSaleDto, userId: string) {
    if (!createSaleDto.items || createSaleDto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    const { subtotal, total } = this.calculateTotals(
      createSaleDto.items,
      createSaleDto.discountAmount || 0,
    );

    return this.prisma.sale.create({
      data: {
        clientId: createSaleDto.clientId,
        sellerId: userId,
        status: createSaleDto.status || SaleStatus.PENDING,
        subtotal,
        discountAmount: createSaleDto.discountAmount || 0,
        total,
        notes: createSaleDto.notes,
        createdById: userId,
        updatedById: userId,
        items: {
          create: createSaleDto.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            observation: item.observation,
          })),
        },
      },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: true } },
      },
    });
  }

  async findAll(page = 1, limit = 10, status?: SaleStatus, clientId?: string, sellerId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (sellerId) where.sellerId = sellerId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          client: true,
          seller: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: { include: { product: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { data: sales, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true } },
        updatedBy: { select: { id: true, email: true, firstName: true } },
        items: { include: { product: true } },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, userId: string) {
    const existingSale = await this.findOne(id);

    let subtotal = existingSale.subtotal.toNumber();
    let total = existingSale.total.toNumber();
    let discountAmount = updateSaleDto.discountAmount !== undefined 
      ? updateSaleDto.discountAmount 
      : existingSale.discountAmount.toNumber();

    if (updateSaleDto.items) {
      if (updateSaleDto.items.length === 0) {
        throw new BadRequestException('Sale must have at least one item');
      }

      const calculated = this.calculateTotals(updateSaleDto.items, discountAmount);
      subtotal = calculated.subtotal;
      total = calculated.total;
    }

    const updateData: any = {
      ...updateSaleDto,
      subtotal,
      discountAmount,
      total,
      updatedById: userId,
    };

    delete updateData.items;

    const [updatedSale] = await this.prisma.$transaction([
      this.prisma.sale.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          seller: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: { include: { product: true } },
        },
      }),
      updateSaleDto.items
        ? this.prisma.saleItem.deleteMany({ where: { saleId: id } })
        : Promise.resolve({ count: 0 }),
    ]);

    if (updateSaleDto.items) {
      await this.prisma.saleItem.createMany({
        data: updateSaleDto.items.map((item) => ({
          saleId: id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
          observation: item.observation,
        })),
      });
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: SaleStatus) {
    const existingSale = await this.findOne(id);
    
    return this.prisma.sale.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.sale.update({
      where: { id },
      data: { status: SaleStatus.CANCELLED },
    });
  }
}