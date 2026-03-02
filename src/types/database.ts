// Auto-generated types will be replaced by `supabase gen types typescript`
// This is a manual placeholder matching PRD v3.0 database design

export type UserRole =
  | "pasien"
  | "admin"
  | "perawat"
  | "dokter"
  | "apoteker"
  | "kasir";

export type Database = {
  public: {
    Tables: {
      // ============================================
      // Authentication Service (Section 8.1)
      // ============================================
      user_accounts: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: "active" | "inactive" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: UserRole;
          status?: "active" | "inactive" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          status?: "active" | "inactive" | "suspended";
          updated_at?: string;
        };
      };

      roles: {
        Row: {
          id: number;
          name: string;
          permissions: string; // JSON array
        };
        Insert: {
          id?: number;
          name: string;
          permissions?: string;
        };
        Update: {
          name?: string;
          permissions?: string;
        };
      };

      // ============================================
      // Patient Service (Section 8.2)
      // ============================================
      pasien: {
        Row: {
          id_pasien: number;
          user_id: string;
          nama: string;
          nik: string;
          tanggal_lahir: string | null;
          alamat: string | null;
          no_hp: string | null;
          email: string | null;
          riwayat_kesehatan: string | null;
        };
        Insert: {
          id_pasien?: number;
          user_id: string;
          nama: string;
          nik: string;
          tanggal_lahir?: string | null;
          alamat?: string | null;
          no_hp?: string | null;
          email?: string | null;
          riwayat_kesehatan?: string | null;
        };
        Update: {
          nama?: string;
          nik?: string;
          tanggal_lahir?: string | null;
          alamat?: string | null;
          no_hp?: string | null;
          email?: string | null;
          riwayat_kesehatan?: string | null;
        };
      };

      form_pendaftaran: {
        Row: {
          id_form: number;
          id_pasien: number;
          tanggal_daftar: string;
          keluhan: string | null;
          permintaan_khusus: string | null;
          status: "pending" | "verified" | "rejected";
        };
        Insert: {
          id_form?: number;
          id_pasien: number;
          tanggal_daftar?: string;
          keluhan?: string | null;
          permintaan_khusus?: string | null;
          status?: "pending" | "verified" | "rejected";
        };
        Update: {
          keluhan?: string | null;
          permintaan_khusus?: string | null;
          status?: "pending" | "verified" | "rejected";
        };
      };

      antrian: {
        Row: {
          id_antrian: number;
          id_form: number;
          nomor_antrian: number;
          waktu_panggil: string | null;
          status: "waiting" | "called" | "done";
          version: number;
        };
        Insert: {
          id_antrian?: number;
          id_form: number;
          nomor_antrian: number;
          waktu_panggil?: string | null;
          status?: "waiting" | "called" | "done";
          version?: number;
        };
        Update: {
          nomor_antrian?: number;
          waktu_panggil?: string | null;
          status?: "waiting" | "called" | "done";
          version?: number;
        };
      };

      feedback: {
        Row: {
          id_feedback: number;
          id_pasien: number;
          rating: number;
          komentar: string | null;
          tanggal_feedback: string;
        };
        Insert: {
          id_feedback?: number;
          id_pasien: number;
          rating: number;
          komentar?: string | null;
          tanggal_feedback?: string;
        };
        Update: {
          rating?: number;
          komentar?: string | null;
        };
      };

      // ============================================
      // Admin & Reporting Service (Section 8.3)
      // ============================================
      admin: {
        Row: {
          id_admin: number;
          user_id: string;
          nama: string;
          email: string;
        };
        Insert: {
          id_admin?: number;
          user_id: string;
          nama: string;
          email: string;
        };
        Update: {
          nama?: string;
          email?: string;
        };
      };

      jadwal: {
        Row: {
          id_jadwal: number;
          id_dokter: number | null;
          id_perawat: number | null;
          hari: string;
          jam_mulai: string;
          jam_selesai: string;
        };
        Insert: {
          id_jadwal?: number;
          id_dokter?: number | null;
          id_perawat?: number | null;
          hari: string;
          jam_mulai: string;
          jam_selesai: string;
        };
        Update: {
          id_dokter?: number | null;
          id_perawat?: number | null;
          hari?: string;
          jam_mulai?: string;
          jam_selesai?: string;
        };
      };

      laporan: {
        Row: {
          id_laporan: number;
          tanggal: string;
          jumlah_pasien: number | null;
          jumlah_transaksi: number | null;
          total_pendapatan: number | null;
          dibuat_oleh: number;
        };
        Insert: {
          id_laporan?: number;
          tanggal: string;
          jumlah_pasien?: number | null;
          jumlah_transaksi?: number | null;
          total_pendapatan?: number | null;
          dibuat_oleh: number;
        };
        Update: {
          jumlah_pasien?: number | null;
          jumlah_transaksi?: number | null;
          total_pendapatan?: number | null;
        };
      };

      // ============================================
      // Medical Record Service (Section 8.4)
      // ============================================
      dokter: {
        Row: {
          id_dokter: number;
          user_id: string;
          nama: string;
          spesialis: string | null;
          no_hp: string | null;
        };
        Insert: {
          id_dokter?: number;
          user_id: string;
          nama: string;
          spesialis?: string | null;
          no_hp?: string | null;
        };
        Update: {
          nama?: string;
          spesialis?: string | null;
          no_hp?: string | null;
        };
      };

      perawat: {
        Row: {
          id_perawat: number;
          user_id: string;
          nama: string;
          no_hp: string | null;
        };
        Insert: {
          id_perawat?: number;
          user_id: string;
          nama: string;
          no_hp?: string | null;
        };
        Update: {
          nama?: string;
          no_hp?: string | null;
        };
      };

      rekam_medis: {
        Row: {
          id_rekam: number;
          id_pasien: number;
          id_dokter: number | null;
          id_perawat: number | null;
          tanggal_periksa: string;
          tekanan_darah: string | null;
          suhu: number | null;
          berat_badan: number | null;
          diagnosa: string | null;
          catatan: string | null;
          rujukan: string | null;
          kontrol_lanjutan: boolean;
        };
        Insert: {
          id_rekam?: number;
          id_pasien: number;
          id_dokter?: number | null;
          id_perawat?: number | null;
          tanggal_periksa?: string;
          tekanan_darah?: string | null;
          suhu?: number | null;
          berat_badan?: number | null;
          diagnosa?: string | null;
          catatan?: string | null;
          rujukan?: string | null;
          kontrol_lanjutan?: boolean;
        };
        Update: {
          id_dokter?: number | null;
          id_perawat?: number | null;
          tekanan_darah?: string | null;
          suhu?: number | null;
          berat_badan?: number | null;
          diagnosa?: string | null;
          catatan?: string | null;
          rujukan?: string | null;
          kontrol_lanjutan?: boolean;
        };
      };

      reminder: {
        Row: {
          id_reminder: number;
          id_rekam: number;
          id_pasien: number;
          tanggal_kontrol: string;
          status: "pending" | "sent" | "completed";
          created_at: string;
        };
        Insert: {
          id_reminder?: number;
          id_rekam: number;
          id_pasien: number;
          tanggal_kontrol: string;
          status?: "pending" | "sent" | "completed";
          created_at?: string;
        };
        Update: {
          tanggal_kontrol?: string;
          status?: "pending" | "sent" | "completed";
        };
      };

      // ============================================
      // Pharmacy Service (Section 8.5)
      // ============================================
      obat: {
        Row: {
          id_obat: number;
          nama_obat: string;
          stok: number;
          harga: number;
          satuan: string | null;
          stok_minimum: number;
        };
        Insert: {
          id_obat?: number;
          nama_obat: string;
          stok: number;
          harga: number;
          satuan?: string | null;
          stok_minimum?: number;
        };
        Update: {
          nama_obat?: string;
          stok?: number;
          harga?: number;
          satuan?: string | null;
          stok_minimum?: number;
        };
      };

      resep: {
        Row: {
          id_resep: number;
          id_rekam: number;
          id_dokter: number;
          tanggal_resep: string;
          status: "pending" | "processing" | "completed";
        };
        Insert: {
          id_resep?: number;
          id_rekam: number;
          id_dokter: number;
          tanggal_resep?: string;
          status?: "pending" | "processing" | "completed";
        };
        Update: {
          status?: "pending" | "processing" | "completed";
        };
      };

      detail_resep: {
        Row: {
          id_detail: number;
          id_resep: number;
          id_obat: number;
          jumlah: number;
          dosis: string | null;
        };
        Insert: {
          id_detail?: number;
          id_resep: number;
          id_obat: number;
          jumlah: number;
          dosis?: string | null;
        };
        Update: {
          jumlah?: number;
          dosis?: string | null;
        };
      };

      purchase_request: {
        Row: {
          id_request: number;
          id_obat: number;
          jumlah_diminta: number;
          status: "pending" | "approved" | "ordered" | "received";
          created_at: string;
          catatan: string | null;
        };
        Insert: {
          id_request?: number;
          id_obat: number;
          jumlah_diminta: number;
          status?: "pending" | "approved" | "ordered" | "received";
          created_at?: string;
          catatan?: string | null;
        };
        Update: {
          jumlah_diminta?: number;
          status?: "pending" | "approved" | "ordered" | "received";
          catatan?: string | null;
        };
      };

      // ============================================
      // Billing Service (Section 8.6)
      // ============================================
      kasir: {
        Row: {
          id_kasir: number;
          user_id: string;
          nama: string;
          no_hp: string | null;
        };
        Insert: {
          id_kasir?: number;
          user_id: string;
          nama: string;
          no_hp?: string | null;
        };
        Update: {
          nama?: string;
          no_hp?: string | null;
        };
      };

      transaksi: {
        Row: {
          id_transaksi: number;
          id_pasien: number;
          id_rekam: number | null;
          tanggal_bayar: string | null;
          total_biaya: number;
          metode_pembayaran: "tunai" | "transfer" | "kartu" | null;
          status: "draft" | "paid" | "failed" | "cancelled";
          id_kasir: number;
        };
        Insert: {
          id_transaksi?: number;
          id_pasien: number;
          id_rekam?: number | null;
          tanggal_bayar?: string | null;
          total_biaya: number;
          metode_pembayaran?: "tunai" | "transfer" | "kartu" | null;
          status?: "draft" | "paid" | "failed" | "cancelled";
          id_kasir: number;
        };
        Update: {
          tanggal_bayar?: string | null;
          total_biaya?: number;
          metode_pembayaran?: "tunai" | "transfer" | "kartu" | null;
          status?: "draft" | "paid" | "failed" | "cancelled";
        };
      };

      rincian_transaksi: {
        Row: {
          id_rincian: number;
          id_transaksi: number;
          keterangan: string | null;
          biaya: number;
        };
        Insert: {
          id_rincian?: number;
          id_transaksi: number;
          keterangan?: string | null;
          biaya: number;
        };
        Update: {
          keterangan?: string | null;
          biaya?: number;
        };
      };

      // ============================================
      // Notification Service (Section 8.7)
      // ============================================
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          title: string;
          message: string;
          type:
            | "antrian"
            | "resep_ready"
            | "pembayaran_done"
            | "kontrol_reminder"
            | "stok_menipis";
          status: "pending" | "sent" | "failed";
          channel: "email" | "sms" | "push";
          retry_count: number;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          title: string;
          message: string;
          type:
            | "antrian"
            | "resep_ready"
            | "pembayaran_done"
            | "kontrol_reminder"
            | "stok_menipis";
          status?: "pending" | "sent" | "failed";
          channel?: "email" | "sms" | "push";
          retry_count?: number;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "sent" | "failed";
          retry_count?: number;
          sent_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      form_status: "pending" | "verified" | "rejected";
      antrian_status: "waiting" | "called" | "done";
      resep_status: "pending" | "processing" | "completed";
      transaksi_status: "draft" | "paid" | "failed" | "cancelled";
      metode_pembayaran: "tunai" | "transfer" | "kartu";
      notification_type:
        | "antrian"
        | "resep_ready"
        | "pembayaran_done"
        | "kontrol_reminder"
        | "stok_menipis";
      notification_status: "pending" | "sent" | "failed";
      notification_channel: "email" | "sms" | "push";
      reminder_status: "pending" | "sent" | "completed";
      purchase_status: "pending" | "approved" | "ordered" | "received";
    };
  };
};
