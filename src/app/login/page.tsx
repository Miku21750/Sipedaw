import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "ADMIN" ? "/admin" : "/petugas");
  return <main className="container" style={{maxWidth:440,paddingTop:80}}><div className="card">
    <h1 style={{marginTop:0}}>Masuk SIPEDAW</h1><p className="muted">Gunakan akun admin atau petugas yang telah dibuat.</p><LoginForm />
  </div></main>;
}
