import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const search = searchParams.get("search")?.trim();

    const where = search
      ? { OR: [{ fullName: { contains: search, mode: "insensitive" as const } }, { nik: { contains: search } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nik: true,
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
