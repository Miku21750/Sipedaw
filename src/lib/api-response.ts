import { NextResponse } from "next/server";

export function apiError(message: string, status = 400, code = "BAD_REQUEST", errors?: unknown) {
  return NextResponse.json({ success: false, code, message, errors }, { status });
}

export function apiSuccess<T>(data: T, message = "Berhasil.", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}
