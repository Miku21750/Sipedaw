import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";

export default async function AdminDashboard(){
 const user=await requireAdmin(); const start=new Date();start.setHours(0,0,0,0);
 const [total,today,unverified,officers]=await Promise.all([
  prisma.resident.count(),prisma.resident.count({where:{createdAt:{gte:start}}}),prisma.resident.count({where:{status:"UNVERIFIED"}}),prisma.user.count({where:{role:"FIELD_OFFICER",isActive:true}})
 ]);
 return <><AppHeader user={user}/><main className="container"><h1>Dashboard Admin</h1><div className="grid grid-3">
  <div className="card"><div className="muted">Total warga</div><h2>{total}</h2></div>
  <div className="card"><div className="muted">Masuk hari ini</div><h2>{today}</h2></div>
  <div className="card"><div className="muted">Belum diverifikasi</div><h2>{unverified}</h2></div>
  <div className="card"><div className="muted">Petugas aktif</div><h2>{officers}</h2></div>
 </div></main></>;
}
