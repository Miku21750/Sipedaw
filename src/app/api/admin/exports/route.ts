import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
export async function GET(){try{await requireAdmin();return apiSuccess(await prisma.exportLog.findMany({include:{actor:{select:{name:true}}},orderBy:{createdAt:"desc"},take:100}));}catch{return apiError("Akses ditolak.",403,"FORBIDDEN");}}
