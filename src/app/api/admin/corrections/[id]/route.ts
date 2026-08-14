import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";
import { residentSchema } from "@/validation/resident";
import { writeAudit } from "@/lib/audit";

const reviewSchema=z.object({decision:z.enum(["APPROVED","REJECTED"]),reviewNote:z.string().trim().max(500).optional()});
const proposedSchema=residentSchema.omit({nik:true}).partial();

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{const rejected=csrfError(request);if(rejected)return rejected;const admin=await requireAdmin();const {id}=await params;const parsed=reviewSchema.safeParse(await request.json());if(!parsed.success)return apiError("Keputusan tidak valid.",400,"VALIDATION_ERROR");const correction=await prisma.correctionRequest.findUnique({where:{id}});if(!correction||correction.status!=="PENDING")return apiError("Pengajuan tidak ditemukan atau sudah ditinjau.",404,"NOT_FOUND");const proposed=proposedSchema.safeParse(correction.proposedData);if(!proposed.success)return apiError("Isi koreksi tidak valid.",400,"INVALID_PROPOSAL");await prisma.$transaction(async tx=>{if(parsed.data.decision==="APPROVED"){const {birthDate,...data}=proposed.data;await tx.resident.update({where:{id:correction.residentId},data:{...data,...(birthDate!==undefined?{birthDate:birthDate?new Date(`${birthDate}T00:00:00.000Z`):null}:{}),status:"VERIFIED"}});}else{await tx.resident.update({where:{id:correction.residentId},data:{status:"UNVERIFIED"}});}await tx.correctionRequest.update({where:{id},data:{status:parsed.data.decision,reviewNote:parsed.data.reviewNote||null,reviewedById:admin.id,reviewedAt:new Date()}});});await writeAudit({actorId:admin.id,action:`CORRECTION_${parsed.data.decision}`,entityType:"CorrectionRequest",entityId:id,metadata:{residentId:correction.residentId}});return apiSuccess(null,parsed.data.decision==="APPROVED"?"Koreksi disetujui dan diterapkan.":"Koreksi ditolak.");}catch{return apiError("Review koreksi gagal.",500,"INTERNAL_ERROR");}}
