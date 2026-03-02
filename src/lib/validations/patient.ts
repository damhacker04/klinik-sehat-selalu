import { z } from "zod/v4";

// PRD Section 12.1 - Validasi Input Patient

export const pasienSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  tanggal_lahir: z.string().optional(),
  alamat: z.string().optional(),
  no_hp: z
    .string()
    .regex(
      /^(0|\+62)\d{7,14}$/,
      "Format nomor telepon tidak valid"
    )
    .optional()
    .or(z.literal("")),
  email: z.email("Format email tidak valid").optional().or(z.literal("")),
  riwayat_kesehatan: z.string().optional(),
});

export const formPendaftaranSchema = z.object({
  keluhan: z.string().min(1, "Keluhan wajib diisi"),
  permintaan_khusus: z.string().optional(),
});

// BR12: Rating 1-5
export const feedbackSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating harus antara 1 sampai 5")
    .max(5, "Rating harus antara 1 sampai 5"),
  komentar: z.string().optional(),
});

export type PasienInput = z.infer<typeof pasienSchema>;
export type FormPendaftaranInput = z.infer<typeof formPendaftaranSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
