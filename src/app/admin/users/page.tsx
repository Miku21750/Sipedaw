import { requireAdmin } from "@/lib/auth";import { AppHeader } from "@/components/app-header";import { UserManager } from "./user-manager";
export default async function UsersPage(){const user=await requireAdmin();return <><AppHeader user={user}/><main className="container"><h1>Kelola User</h1><UserManager currentUserId={user.id}/></main></>}
