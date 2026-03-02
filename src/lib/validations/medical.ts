import { z } from "zod/v4";

// PRD Section 12.1 - Validasi Input Medical Record

export const vitalSignsSchema = z.object({
  tekanan_darah: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/, "Format tekanan darah tidak valid (contoh: 120/80)")
    .optional()
    .or(z.literal("")),
  suhu: z
    .number()
    .min(30.0, "Suhu di luar rentang normal, periksa kembali")
    .max(45.0, "Suhu di luar rentang normal, periksa kembali")
    .optional(),
  berat_badan: z
    .number()
    .min(0.5, "Berat badan di luar rentang valid")
    .max(500, "Berat badan di luar rentang valid")
    .optional(),
  catatan: z.string().optional(),
});

export const diagnosisSchema = z.object({
  diagnosa: z.string().min(1, "Diagnosa wajib diisi"),
  rujukan: z.string().optional(),
  kontrol_lanjutan: z.boolean().default(false),
});

export const resepSchema = z.object({
  items: z
    .array(
      z.object({
        id_obat: z.number().int().positive(),
        jumlah: z.number().int().positive("Jumlah harus lebih dari 0"),
        dosis: z.string().optional(),
      })
    )
    .min(1, "Resep harus memiliki minimal 1 item"),
});

export const reminderSchema = z.object({
  id_rekam: z.number().int().positive(),
  id_pasien: z.number().int().positive(),
  tanggal_kontrol: z.string().min(1, "Tanggal kontrol wajib diisi"),
});

export type VitalSignsInput = z.infer<typeof vitalSignsSchema>;
export type DiagnosisInput = z.infer<typeof diagnosisSchema>;
export type ResepInput = z.infer<typeof resepSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
