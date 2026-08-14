import { destroySession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";
import { csrfError } from "@/lib/request-security";

export async function POST(request: Request) {
  const rejected = csrfError(request); if (rejected) return rejected;
  await destroySession();
  return apiSuccess(null, "Logout berhasil.");
}
