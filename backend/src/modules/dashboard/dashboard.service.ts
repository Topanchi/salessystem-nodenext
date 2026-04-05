import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaleStatus, EventStatus } from '../../common/enums';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalSalesThisMonth,
      salesByStatus,
      totalEventsThisMonth,
      eventsByStatus,
      upcomingEvents,
      confirmedAmount,
      topProducts,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { not: SaleStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.sale.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.event.count({
        where: {
          eventDate: { gte: startOfMonth, lte: endOfMonth },
          status: { not: EventStatus.CANCELLED },
        },
      }),
      this.prisma.event.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.event.findMany({
        where: {
          eventDate: { gte: now },
          status: { in: [EventStatus.QUOTED, EventStatus.CONFIRMED, EventStatus.IN_PREPARATION] },
        },
        include: {
          client: { select: { firstName: true, lastName: true, phone: true } },
        },
        orderBy: { eventDate: 'asc' },
        take: 5,
      }),
      this.prisma.sale.aggregate({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { in: [SaleStatus.CONFIRMED, SaleStatus.IN_PREPARATION, SaleStatus.DELIVERED] },
        },
        _sum: { total: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    let topProductsWithDetails = [];
    if (topProducts.length > 0) {
      const productIds = topProducts.map((p) => p.productId).filter(Boolean);
      if (productIds.length > 0) {
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, category: true },
        });
        topProductsWithDetails = topProducts
          .filter((p) => p.productId)
          .map((p) => {
            const product = products.find((prod) => prod.id === p.productId);
            return {
              productId: p.productId,
              name: product?.name || 'Producto eliminado',
              category: product?.category,
              totalQuantity: p._sum.quantity,
            };
          });
      }
    }

    return {
      totalSalesThisMonth: totalSalesThisMonth._sum.total?.toNumber() || 0,
      salesCountThisMonth: totalSalesThisMonth._count,
      salesByStatus: salesByStatus.map((s) => ({ status: s.status, count: s._count })),
      totalEventsThisMonth,
      eventsByStatus: eventsByStatus.map((e) => ({ status: e.status, count: e._count })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        name: e.name,
        date: e.eventDate,
        client: `${e.client.firstName} ${e.client.lastName || ''}`.trim(),
        phone: e.client.phone,
        status: e.status,
      })),
      confirmedAmount: confirmedAmount._sum.total?.toNumber() || 0,
      topProducts: topProductsWithDetails,
    };
  }
}