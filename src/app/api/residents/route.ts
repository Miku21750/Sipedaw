import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { residentSchema } from "@/validation/resident";
import { writeAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const parsed = residentSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Data belum valid.", 400, "VALIDATION_ERROR", parsed.error.flatten());

    const data = parsed.data;
    const resident = await prisma.resident.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(`${data.birthDate}T00:00:00.000Z`) : null,
        village: data.village || null,
        district: data.district || null,
        phoneNumber: data.phoneNumber || null,
        note: data.note || null,
        createdById: session.id,
      },
      select: { id: true, createdAt: true },
    });

    await writeAudit({
      actorId: session.id,
      action: "RESIDENT_CREATED",
      entityType: "Resident",
      entityId: resident.id,
      metadata: { nikLastFour: data.nik.slice(-4) },
    });

    return apiSuccess(resident, "Data warga berhasil disimpan.", 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("NIK sudah terdaftar.", 409, "NIK_ALREADY_EXISTS");
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Sesi tidak valid.", 401, "UNAUTHORIZED");
    }
    return apiError("Terjadi kesalahan saat menyimpan data.", 500, "INTERNAL_ERROR");
  }
}
