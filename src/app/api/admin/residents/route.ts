import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { Prisma } from "@prisma/client";
import { pageNumber } from "@/lib/table";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = pageNumber(searchParams.get("page"), 1, 10_000_000);
    const limit = pageNumber(searchParams.get("limit"), 20, 100);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    if (status && !["UNVERIFIED", "VERIFIED", "NEEDS_CORRECTION", "INACTIVE"].includes(status)) {
      return apiError("Status tidak valid.", 400, "VALIDATION_ERROR");
    }
    const direction = searchParams.get("direction") === "desc" ? "desc" : "asc";
    const orders: Record<string, Prisma.ResidentOrderByWithRelationInput[]> = {
      nikLastFour: [{ nikLastFour: direction }],
      fullName: [{ fullName: direction }],
      rt: [{ rt: direction }, { rw: direction }],
      status: [{ status: direction }],
      createdBy: [{ createdBy: { name: direction } }],
    };
    const sort = searchParams.get("sort") || "";
    const orderBy: Prisma.ResidentOrderByWithRelationInput[] = [
      ...(Object.hasOwn(orders, sort) ? orders[sort] : [{ createdAt: "desc" as const }]), { id: "asc" },
    ];

    const where = {
      ...(search ? { OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { nikLastFour: { contains: search } },
        { rt: { contains: search } },
        { rw: { contains: search } },
        { createdBy: { name: { contains: search, mode: "insensitive" as const } } },
      ] } : {}),
      ...(status ? { status: status as "UNVERIFIED" | "VERIFIED" | "NEEDS_CORRECTION" | "INACTIVE" } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nikLastFour: true,
          fullName: true,
          rt: true,
          rw: true,
          status: true,
          createdAt: true,
          createdBy: { select: { name: true } },
        },
      }),
      prisma.resident.count({ where }),
    ]);

    return apiSuccess({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    return apiError("Akses ditolak.", 403, "FORBIDDEN");
  }
}
