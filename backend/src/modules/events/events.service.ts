import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventStatus } from '../../../common/enums';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    return this.prisma.event.create({
      data: {
        clientId: createEventDto.clientId,
        sellerId: userId,
        name: createEventDto.name,
        type: createEventDto.type,
        eventDate: new Date(createEventDto.eventDate),
        eventTime: createEventDto.eventTime ? new Date(`1970-01-01T${createEventDto.eventTime}`) : undefined,
        location: createEventDto.location,
        guestCount: createEventDto.guestCount,
        serviceDetails: createEventDto.serviceDetails,
        observations: createEventDto.observations,
        status: createEventDto.status || EventStatus.QUOTED,
        saleId: createEventDto.saleId,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        sale: true,
      },
    });
  }

  async findAll(page = 1, limit = 10, status?: EventStatus, clientId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate);
      if (endDate) where.eventDate.lte = new Date(endDate);
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          client: true,
          seller: { select: { id: true, email: true, firstName: true, lastName: true } },
          sale: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { eventDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data: events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, email: true, firstName: true } },
        updatedBy: { select: { id: true, email: true, firstName: true } },
        sale: true,
        documents: { where: { active: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    await this.findOne(id);

    const data: any = { ...updateEventDto };

    if (updateEventDto.eventDate) {
      data.eventDate = new Date(updateEventDto.eventDate);
    }

    if (updateEventDto.eventTime) {
      data.eventTime = new Date(`1970-01-01T${updateEventDto.eventTime}`);
    }

    data.updatedById = userId;

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        sale: true,
        documents: { where: { active: true } },
      },
    });
  }

  async updateStatus(id: string, status: EventStatus) {
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        seller: { select: { id: true, email: true, firstName: true, lastName: true } },
        sale: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  async getUpcomingEvents(limit = 5) {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        eventDate: { gte: now },
        status: { in: [EventStatus.QUOTED, EventStatus.CONFIRMED, EventStatus.IN_PREPARATION] },
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, phone: true } },
        seller: { select: { firstName: true, lastName: true } },
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });
  }
}