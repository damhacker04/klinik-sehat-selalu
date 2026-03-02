import { z } from "zod/v4";

// PRD Section 12.1 - Validasi Input Pharmacy

export const obatSchema = z.object({
  nama_obat: z.string().min(1, "Nama obat wajib diisi"),
  stok: z.number().int().min(0, "Stok tidak boleh negatif"),
  harga: z.number().positive("Harga harus lebih besar dari 0"),
  satuan: z.string().optional(),
  stok_minimum: z.number().int().min(0).default(10),
});

export const purchaseRequestSchema = z.object({
  id_obat: z.number().int().positive(),
  jumlah_diminta: z.number().int().positive("Jumlah harus lebih dari 0"),
  catatan: z.string().optional(),
});

export type ObatInput = z.infer<typeof obatSchema>;
export type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>;
