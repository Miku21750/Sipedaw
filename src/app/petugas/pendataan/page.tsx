import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ResidentEntryForm } from "./resident-entry-form";

export default async function EntryPage(){ const user=await requireSession(); if(user.role!=="FIELD_OFFICER") redirect("/admin"); return <><AppHeader user={user}/><main className="container" style={{maxWidth:850}}><h1>Pendataan Warga</h1><ResidentEntryForm/></main></>; }
