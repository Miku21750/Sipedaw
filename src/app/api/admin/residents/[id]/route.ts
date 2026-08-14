import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { residentUpdateSchema } from "@/validation/resident";
import { hashNik, nikStorage, readableNik } from "@/lib/nik-crypto";
import { csrfError } from "@/lib/request-security";
import { writeAudit } from "@/lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(); const { id } = await params;
    const resident = await prisma.resident.findUnique({ where: { id } });
    if (!resident) return apiError("Warga tidak ditemukan.", 404, "NOT_FOUND");
    const { nikEncrypted, nikHash, legacyNik, ...safe } = resident;
    return apiSuccess({ ...safe, nik: readableNik({nikEncrypted, legacyNik}) });
  } catch { return apiError("Akses ditolak atau konfigurasi enkripsi tidak valid.", 403, "FORBIDDEN"); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rejected = csrfError(request); if (rejected) return rejected;
    const admin = await requireAdmin(); const { id } = await params;
    const parsed = residentUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Data belum valid.", 400, "VALIDATION_ERROR", parsed.error.flatten());
    const { nik, birthDate, status, ...data } = parsed.data;
    const duplicate = await prisma.resident.findFirst({ where: { id:{not:id}, OR:[{nikHash:hashNik(nik)},{legacyNik:nik}] }, select:{id:true} });
    if (duplicate) return apiError("NIK sudah terdaftar.",409,"NIK_ALREADY_EXISTS");
    const resident = await prisma.resident.update({ where: { id }, data: {
      ...data, ...nikStorage(nik), status,
      birthDate: birthDate ? new Date(`${birthDate}T00:00:00.000Z`) : null,
      village:data.village||null,district:data.district||null,phoneNumber:data.phoneNumber||null,note:data.note||null,
      inactiveAt: status === "INACTIVE" ? new Date() : null,
    }});
    await writeAudit({actorId:admin.id,action:"RESIDENT_UPDATED",entityType:"Resident",entityId:id,metadata:{status}});
    return apiSuccess({ id: resident.id }, "Data warga diperbarui.");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError("NIK sudah terdaftar.",409,"NIK_ALREADY_EXISTS");
    return apiError("Data warga gagal diperbarui.",500,"INTERNAL_ERROR");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rejected = csrfError(request); if (rejected) return rejected;
    const admin=await requireAdmin(); const {id}=await params;
    await prisma.resident.update({where:{id},data:{status:"INACTIVE",inactiveAt:new Date()}});
    await writeAudit({actorId:admin.id,action:"RESIDENT_DEACTIVATED",entityType:"Resident",entityId:id});
    return apiSuccess(null,"Warga dinonaktifkan tanpa menghapus data.");
  } catch { return apiError("Warga gagal dinonaktifkan.",400,"UPDATE_FAILED"); }
}
