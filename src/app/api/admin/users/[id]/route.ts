import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";
import { userUpdateSchema } from "@/validation/admin";
import { writeAudit } from "@/lib/audit";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
 try { const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const {id}=await params;const parsed=userUpdateSchema.safeParse(await request.json());if(!parsed.success)return apiError("Data user belum valid.",400,"VALIDATION_ERROR",parsed.error.flatten());const {password,teamId,...data}=parsed.data;if(id===admin.id&&!data.isActive)return apiError("Admin tidak dapat menonaktifkan akun sendiri.",400,"SELF_DEACTIVATION");await prisma.user.update({where:{id},data:{...data,teamId:data.role==="FIELD_OFFICER"?(teamId||null):null,...(password?{passwordHash:await bcrypt.hash(password,12)}:{})}});await writeAudit({actorId:admin.id,action:"USER_UPDATED",entityType:"User",entityId:id,metadata:{isActive:data.isActive,role:data.role}});return apiSuccess(null,"User berhasil diperbarui.");}
 catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return apiError("Username sudah digunakan.",409,"DUPLICATE");return apiError("User gagal diperbarui.",400,"UPDATE_FAILED");}
}

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}) {
 try{const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const {id}=await params;if(id===admin.id)return apiError("Admin tidak dapat menonaktifkan akun sendiri.",400,"SELF_DEACTIVATION");await prisma.user.update({where:{id},data:{isActive:false}});await writeAudit({actorId:admin.id,action:"USER_DEACTIVATED",entityType:"User",entityId:id});return apiSuccess(null,"User dinonaktifkan tanpa menghapus data.");}catch{return apiError("User gagal dinonaktifkan.",400,"UPDATE_FAILED");}
}
