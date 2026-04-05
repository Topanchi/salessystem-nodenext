import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, userId: string) {
    if (createClientDto.rut) {
      const existingClient = await this.prisma.client.findUnique({
        where: { rut: createClientDto.rut },
      });
      if (existingClient) {
        throw new ConflictException('RUT already exists');
      }
    }

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { businessName: { contains: search, mode: 'insensitive' } },
            { rut: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
          active: true,
        }
      : { active: true };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: { createdBy: { select: { id: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data: clients, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true } },
        updatedBy: { select: { id: true, email: true, firstName: true } },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string) {
    await this.findOne(id);

    if (updateClientDto.rut) {
      const existingClient = await this.prisma.client.findFirst({
        where: { rut: updateClientDto.rut, NOT: { id } },
      });
      if (existingClient) {
        throw new ConflictException('RUT already exists');
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.client.update({
      where: { id },
      data: { active: false },
    });
  }

  async findActiveClients() {
    return this.prisma.client.findMany({
      where: { active: true },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true, businessName: true, email: true },
    });
  }
}