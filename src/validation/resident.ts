import { z } from "zod";

export const nikSchema = z.string().regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka.");

export const residentSchema = z.object({
  nik: nikSchema,
  fullName: z.string().trim().min(2).max(150),
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: z.string().optional().or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  rt: z.string().regex(/^\d{1,3}$/).transform((v) => v.padStart(3, "0")),
  rw: z.string().regex(/^\d{1,3}$/).transform((v) => v.padStart(3, "0")),
  village: z.string().trim().max(100).optional().or(z.literal("")),
  district: z.string().trim().max(100).optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^08\d{8,13}$/).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const residentUpdateSchema = residentSchema.extend({
  status: z.enum(["UNVERIFIED", "VERIFIED", "NEEDS_CORRECTION", "INACTIVE"]),
});

export const correctionSchema = z.object({
  residentId: z.string().min(1),
  reason: z.string().trim().min(5).max(500),
  proposedData: residentSchema.omit({ nik: true }).partial().refine((value) => Object.keys(value).length > 0, "Minimal satu perubahan diperlukan."),
});
