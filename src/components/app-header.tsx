import Link from "next/link";
import { LogoutButton } from "./logout-button";
import type { SessionUser } from "@/lib/auth";

export function AppHeader({ user }: { user: SessionUser }) {
  return <header className="topbar"><div className="container topbar-inner">
    <div><strong>SIPEDAW</strong><div className="muted" style={{fontSize:13}}>Sistem Pendataan Warga</div></div>
    <nav className="nav">
      <Link href={user.role === "ADMIN" ? "/admin" : "/petugas"}>Dashboard</Link>
      {user.role === "ADMIN" ? <Link href="/admin/warga">Data Warga</Link> : <Link href="/petugas/pendataan">Pendataan</Link>}
      <span className="muted">{user.name}</span><LogoutButton />
    </nav>
  </div></header>;
}
