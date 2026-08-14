import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";
import { teamCreateSchema } from "@/validation/admin";
import { writeAudit } from "@/lib/audit";

export async function GET(){try{await requireAdmin();return apiSuccess(await prisma.team.findMany({include:{_count:{select:{users:true}}},orderBy:{name:"asc"}}));}catch{return apiError("Akses ditolak.",403,"FORBIDDEN");}}
export async function POST(request:Request){try{const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const parsed=teamCreateSchema.safeParse(await request.json());if(!parsed.success)return apiError("Data tim belum valid.",400,"VALIDATION_ERROR",parsed.error.flatten());const team=await prisma.team.create({data:parsed.data});await writeAudit({actorId:admin.id,action:"TEAM_CREATED",entityType:"Team",entityId:team.id});return apiSuccess({id:team.id},"Tim berhasil dibuat.",201);}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return apiError("Nama atau kode tim sudah digunakan.",409,"DUPLICATE");return apiError("Tim gagal dibuat.",500,"INTERNAL_ERROR");}}
