"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username:form.get("username"),password:form.get("password")}) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return setError(result.message ?? "Login gagal.");
    router.replace(result.data.role === "ADMIN" ? "/admin" : "/petugas"); router.refresh();
  }
  return <form onSubmit={submit} className="grid">
    {error && <div className="alert">{error}</div>}
    <label>Username<input name="username" autoComplete="username" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
    <button disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
  </form>;
}
