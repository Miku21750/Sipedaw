import { requireAdmin } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ResidentManager } from "./resident-manager";

export default async function ResidentsPage(){const user=await requireAdmin();return <><AppHeader user={user}/><main className="container"><h1>Kelola Warga</h1><ResidentManager/></main></>;}
