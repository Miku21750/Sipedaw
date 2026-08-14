import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "FIELD_OFFICER"]),
  teamId: z.string().nullable().optional(),
});

export const userUpdateSchema = userCreateSchema.omit({ password: true }).extend({
  password: z.string().min(8).max(128).optional(),
  isActive: z.boolean(),
});

export const teamCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(30).regex(/^[A-Z0-9-]+$/),
});

export const teamUpdateSchema = teamCreateSchema.extend({ isActive: z.boolean() });
