import { apiError } from "@/lib/api-response";

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function validateCsrf(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function csrfError(request: Request) {
  return validateCsrf(request) ? null : apiError("Permintaan lintas situs ditolak.", 403, "CSRF_REJECTED");
}
