import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";

const schema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError("Username atau password tidak valid.", 400, "VALIDATION_ERROR");

  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !user.isActive) return apiError("Username atau password salah.", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return apiError("Username atau password salah.", 401, "INVALID_CREDENTIALS");

  await createSession({ id: user.id, name: user.name, username: user.username, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return apiSuccess({ role: user.role }, "Login berhasil.");
}
