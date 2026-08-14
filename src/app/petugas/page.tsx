import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app-header";

export default async function OfficerDashboard() {
  const user = await requireSession(); if (user.role !== "FIELD_OFFICER") redirect("/admin");
  const start = new Date(); start.setHours(0,0,0,0);
  const [today,total] = await Promise.all([
    prisma.resident.count({where:{createdById:user.id,createdAt:{gte:start}}}),
    prisma.resident.count({where:{createdById:user.id}}),
  ]);
  return <><AppHeader user={user}/><main className="container"><h1>Dashboard Petugas</h1><div className="grid grid-3">
    <div className="card"><div className="muted">Input hari ini</div><h2>{today}</h2></div>
    <div className="card"><div className="muted">Total input saya</div><h2>{total}</h2></div>
    <div className="card"><div className="muted">Aksi utama</div><p><Link className="button" href="/petugas/pendataan">Mulai pendataan</Link></p></div>
  </div></main></>;
}
