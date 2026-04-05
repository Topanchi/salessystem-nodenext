import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '../../common/enums';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    entity: string,
    entityId: string,
    action: AuditAction,
    userId: string | null,
    oldValue?: any,
    newValue?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        userId,
        oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
        newValue: newValue ? JSON.stringify(newValue) : undefined,
      },
    });
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { email: true, firstName: true } } },
    });
  }
}