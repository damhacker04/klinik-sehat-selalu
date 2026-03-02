import { z } from "zod/v4";

// PRD Section 12.1 - Validasi Input Billing

export const transaksiSchema = z.object({
  id_pasien: z.number().int().positive(),
  id_rekam: z.number().int().positive().optional(),
  items: z
    .array(
      z.object({
        keterangan: z.string().min(1, "Keterangan wajib diisi"),
        biaya: z.number().positive("Biaya harus lebih besar dari 0"),
      })
    )
    .min(1, "Transaksi harus memiliki minimal 1 item"),
});

export const pembayaranSchema = z.object({
  metode: z.enum(["tunai", "transfer", "kartu"], {
    message: "Metode pembayaran tidak valid",
  }),
  jumlah_bayar: z.number().positive("Jumlah bayar harus lebih besar dari 0"),
});

export type TransaksiInput = z.infer<typeof transaksiSchema>;
export type PembayaranInput = z.infer<typeof pembayaranSchema>;
