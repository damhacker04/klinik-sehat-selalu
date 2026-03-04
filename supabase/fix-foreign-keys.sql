-- ============================================================
-- FIX: Missing Foreign Key Constraints
-- Jalankan di Supabase SQL Editor
-- Diperlukan agar Supabase PostgREST FK join berfungsi
-- ============================================================

-- 1. jadwal → dokter & perawat
ALTER TABLE jadwal
  ADD CONSTRAINT fk_jadwal_dokter FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE SET NULL;
ALTER TABLE jadwal
  ADD CONSTRAINT fk_jadwal_perawat FOREIGN KEY (id_perawat) REFERENCES perawat(id_perawat) ON DELETE SET NULL;

-- 2. rekam_medis → pasien
ALTER TABLE rekam_medis
  ADD CONSTRAINT fk_rekam_medis_pasien FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien) ON DELETE CASCADE;

-- 3. resep → rekam_medis & dokter
ALTER TABLE resep
  ADD CONSTRAINT fk_resep_rekam FOREIGN KEY (id_rekam) REFERENCES rekam_medis(id_rekam) ON DELETE CASCADE;
ALTER TABLE resep
  ADD CONSTRAINT fk_resep_dokter FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter);

-- 4. transaksi → pasien & rekam_medis
ALTER TABLE transaksi
  ADD CONSTRAINT fk_transaksi_pasien FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien);
ALTER TABLE transaksi
  ADD CONSTRAINT fk_transaksi_rekam FOREIGN KEY (id_rekam) REFERENCES rekam_medis(id_rekam) ON DELETE SET NULL;

-- 5. reminder → pasien
ALTER TABLE reminder
  ADD CONSTRAINT fk_reminder_pasien FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien) ON DELETE CASCADE;

-- ============================================================
-- DONE! Semua FK constraint yang dibutuhkan sudah ditambahkan.
-- API routes yang menggunakan FK join sekarang akan berfungsi.
-- ============================================================
