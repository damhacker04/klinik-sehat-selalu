// Business Rules dari PRD v3.0 Section 12

export const APP_NAME = "Klinik Sehat Selalu";

// BR01: Session expiry - 24 jam, auto-refresh jika sisa < 1 jam
export const SESSION_EXPIRY_HOURS = 24;
export const SESSION_REFRESH_THRESHOLD_HOURS = 1;

// BR02: Stok minimum threshold default
export const DEFAULT_STOK_MINIMUM = 10;

// BR03: Maksimal antrian per hari
export const MAX_ANTRIAN_PER_HARI = 100;

// BR04: Jam operasional
export const JAM_OPERASIONAL = {
  mulai: "08:00",
  selesai: "17:00",
} as const;

// BR06: Metode pembayaran yang didukung
export const METODE_PEMBAYARAN = ["tunai", "transfer", "kartu"] as const;

// BR07: Retry notifikasi - exponential backoff
export const NOTIFICATION_RETRY = {
  maxRetries: 3,
  intervals: [1000, 5000, 30000], // 1s, 5s, 30s
} as const;

// BR08: Batas resep per kunjungan
export const MAX_RESEP_PER_KUNJUNGAN = 1;

// BR09: Password reset token validity (1 jam)
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

// BR12: Feedback window - 7 hari setelah kunjungan
export const FEEDBACK_WINDOW_DAYS = 7;

// NFR 14.1: Rate limiting
export const RATE_LIMIT = {
  perUser: 100, // request/menit
  perService: 1000, // request/menit
} as const;

// NFR 13.3: Circuit breaker & Retry policy
export const CIRCUIT_BREAKER = {
  tripAfterErrors: 5,
  tripWindowSeconds: 30,
  halfOpenAfterSeconds: 60,
} as const;

export const SYNC_RETRY = {
  timeout: 5000, // 5 detik
  maxRetries: 3,
  intervals: [1000, 2000, 4000], // exponential backoff
} as const;

// Roles (PRD Section 1.3)
export const ROLES = {
  PASIEN: "pasien",
  ADMIN: "admin",
  PERAWAT: "perawat",
  DOKTER: "dokter",
  APOTEKER: "apoteker",
  KASIR: "kasir",
} as const;

// Route mappings per role
export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  pasien: "/pasien",
  admin: "/admin",
  perawat: "/perawat",
  dokter: "/dokter",
  apoteker: "/apoteker",
  kasir: "/kasir",
} as const;

// Hari operasional
export const HARI = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;
