import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { nikSchema } from "@/validation/resident";

export async function POST(request: Request) {
  try {
    await requireSession();
    const parsed = nikSchema.safeParse((await request.json()).nik);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "NIK tidak valid.", 400, "VALIDATION_ERROR");

    const exists = await prisma.resident.findUnique({ where: { nik: parsed.data }, select: { id: true } });
    return apiSuccess({ exists: Boolean(exists) }, exists ? "NIK sudah terdaftar." : "NIK belum terdaftar.");
  } catch {
    return apiError("Sesi tidak valid.", 401, "UNAUTHORIZED");
  }
}
