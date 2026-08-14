import { requireAdmin } from "@/lib/auth";import { AppHeader } from "@/components/app-header";import { TeamManager } from "./team-manager";
export default async function TeamsPage(){const user=await requireAdmin();return <><AppHeader user={user}/><main className="container"><h1>Kelola Tim</h1><TeamManager/></main></>}
