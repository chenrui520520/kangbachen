import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

export const auditService = {
  async log(opts: {
    adminUserId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        adminUserId: opts.adminUserId,
        action: opts.action,
        resource: opts.resource,
        resourceId: opts.resourceId,
        metadata: (opts.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
      },
    });
  },

  list(page: number, limit: number) {
    return Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { adminUser: { select: { email: true, role: true } } },
      }),
    ]).then(([total, rows]) => ({ total, page, limit, rows }));
  },
};
