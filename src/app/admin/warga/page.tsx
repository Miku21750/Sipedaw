import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";

export default async function ResidentsPage({searchParams}:{searchParams:Promise<{search?:string}>}){
 const user=await requireAdmin(); const params=await searchParams; const search=params.search?.trim();
 const rows=await prisma.resident.findMany({where:search?{OR:[{fullName:{contains:search,mode:"insensitive"}},{nik:{contains:search}}]}:{},orderBy:{createdAt:"desc"},take:100,include:{createdBy:{select:{name:true}}}});
 return <><AppHeader user={user}/><main className="container"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}><h1>Data Warga</h1><form><input name="search" defaultValue={search} placeholder="Cari NIK atau nama" style={{minWidth:280}}/></form></div><div className="card" style={{overflowX:"auto"}}><table><thead><tr><th>NIK</th><th>Nama</th><th>RT/RW</th><th>Status</th><th>Petugas</th><th>Waktu</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.nik.replace(/^\d{12}/,"************")}</td><td>{r.fullName}</td><td>{r.rt}/{r.rw}</td><td>{r.status}</td><td>{r.createdBy.name}</td><td>{new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(r.createdAt)}</td></tr>)}{rows.length===0&&<tr><td colSpan={6} className="muted">Belum ada data.</td></tr>}</tbody></table></div></main></>;
}
