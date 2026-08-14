import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(){try{await requireAdmin();return apiSuccess(await prisma.correctionRequest.findMany({include:{resident:{select:{id:true,fullName:true,nikLastFour:true}},requestedBy:{select:{name:true}},reviewedBy:{select:{name:true}}},orderBy:{createdAt:"desc"},take:200}));}catch{return apiError("Akses ditolak.",403,"FORBIDDEN");}}
