import { z } from "zod/v4";
import { HARI } from "@/lib/constants";

// PRD Section 12.1 - Validasi Input Admin

export const verifikasiFormSchema = z.object({
  valid: z.boolean(),
});

export const jadwalSchema = z.object({
  id_dokter: z.number().int().positive().optional(),
  id_perawat: z.number().int().positive().optional(),
  hari: z.enum(HARI, {
    message: "Hari tidak valid",
  }),
  jam_mulai: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:MM)"),
  jam_selesai: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:MM)"),
});

export const roleAssignmentSchema = z.object({
  role: z.enum(["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"], {
    message: "Role tidak valid",
  }),
});

export type VerifikasiFormInput = z.infer<typeof verifikasiFormSchema>;
export type JadwalInput = z.infer<typeof jadwalSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
