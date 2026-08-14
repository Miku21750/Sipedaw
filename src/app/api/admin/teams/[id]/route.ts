import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";
import { teamUpdateSchema } from "@/validation/admin";
import { writeAudit } from "@/lib/audit";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const {id}=await params;const parsed=teamUpdateSchema.safeParse(await request.json());if(!parsed.success)return apiError("Data tim belum valid.",400,"VALIDATION_ERROR",parsed.error.flatten());await prisma.team.update({where:{id},data:parsed.data});await writeAudit({actorId:admin.id,action:"TEAM_UPDATED",entityType:"Team",entityId:id,metadata:{isActive:parsed.data.isActive}});return apiSuccess(null,"Tim diperbarui.");}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return apiError("Nama atau kode tim sudah digunakan.",409,"DUPLICATE");return apiError("Tim gagal diperbarui.",400,"UPDATE_FAILED");}}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const {id}=await params;await prisma.team.update({where:{id},data:{isActive:false}});await writeAudit({actorId:admin.id,action:"TEAM_DEACTIVATED",entityType:"Team",entityId:id});return apiSuccess(null,"Tim dinonaktifkan tanpa menghapus data.");}catch{return apiError("Tim gagal dinonaktifkan.",400,"UPDATE_FAILED");}}
