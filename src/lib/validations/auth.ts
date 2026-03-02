import { z } from "zod/v4";

// PRD Section 12.1 - Validasi Input

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    nama: z.string().min(1, "Nama wajib diisi"),
    email: z.email("Format email tidak valid"),
    nik: z
      .string()
      .regex(/^\d{16}$/, "NIK harus 16 digit angka"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar dan angka"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({
  email: z.email("Format email tidak valid"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Token wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar dan angka"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
