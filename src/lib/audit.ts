import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function writeAudit(input: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue : undefined,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}
