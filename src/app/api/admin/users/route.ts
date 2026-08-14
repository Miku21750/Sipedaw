import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";
import { userCreateSchema } from "@/validation/admin";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  try { await requireAdmin(); return apiSuccess(await prisma.user.findMany({select:{id:true,name:true,username:true,role:true,teamId:true,isActive:true,lastLoginAt:true,team:{select:{name:true}}},orderBy:{createdAt:"desc"}})); }
  catch { return apiError("Akses ditolak.",403,"FORBIDDEN"); }
}

export async function POST(request:Request) {
  try {
    const rejected=csrfError(request); if(rejected)return rejected; const admin=await requireAdmin();
    const parsed=userCreateSchema.safeParse(await request.json()); if(!parsed.success)return apiError("Data user belum valid.",400,"VALIDATION_ERROR",parsed.error.flatten());
    const {password,teamId,...data}=parsed.data;
    const user=await prisma.user.create({data:{...data,passwordHash:await bcrypt.hash(password,12),teamId:data.role==="FIELD_OFFICER"?(teamId||null):null}});
    await writeAudit({actorId:admin.id,action:"USER_CREATED",entityType:"User",entityId:user.id,metadata:{role:user.role}});
    return apiSuccess({id:user.id},"User berhasil dibuat.",201);
  } catch(error) { if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002")return apiError("Username sudah digunakan.",409,"DUPLICATE"); return apiError("User gagal dibuat.",500,"INTERNAL_ERROR"); }
}
