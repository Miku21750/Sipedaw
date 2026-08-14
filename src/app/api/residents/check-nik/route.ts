import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { nikSchema } from "@/validation/resident";
import { hashNik } from "@/lib/nik-crypto";
import { clientIp, csrfError } from "@/lib/request-security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const rejected = csrfError(request); if (rejected) return rejected;
    const session = await requireSession();
    const limit = rateLimit(`nik:${session.id}:${clientIp(request)}`, 30, 60_000);
    if (!limit.allowed) return apiError("Terlalu banyak pemeriksaan NIK. Coba lagi sebentar.", 429, "RATE_LIMITED");
    const parsed = nikSchema.safeParse((await request.json()).nik);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "NIK tidak valid.", 400, "VALIDATION_ERROR");

    const exists = await prisma.resident.findFirst({ where: { OR: [{ nikHash: hashNik(parsed.data) }, { legacyNik: parsed.data }] }, select: { id: true } });
    return apiSuccess({ exists: Boolean(exists) }, exists ? "NIK sudah terdaftar." : "NIK belum terdaftar.");
  } catch {
    return apiError("Sesi tidak valid.", 401, "UNAUTHORIZED");
  }
}
