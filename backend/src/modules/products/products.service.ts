import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductCategory } from '../../../common/enums';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page = 1, limit = 10, category?: ProductCategory, search?: string) {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    where.active = true;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { createdBy: { select: { id: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true } },
        updatedBy: { select: { id: true, email: true, firstName: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  async findActiveProducts() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, category: true, basePrice: true },
    });
  }
}