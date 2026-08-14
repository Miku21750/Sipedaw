import { destroySession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";

export async function POST() {
  await destroySession();
  return apiSuccess(null, "Logout berhasil.");
}
