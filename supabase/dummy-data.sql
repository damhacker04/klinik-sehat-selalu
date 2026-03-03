-- ============================================================
-- KLINIK SEHAT SELALU - DUMMY DATA
-- Jalankan di Supabase SQL Editor SETELAH run-all-migrations.sql
-- ============================================================
-- Password semua user: password123
-- ============================================================

-- ============================================
-- 1. CREATE DUMMY AUTH USERS (6 roles)
-- ============================================

-- Pasien: Budi Santoso
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'pasien@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "pasien", "nama": "Budi Santoso", "nik": "3201012345670001"}',
  NOW(), NOW(), '', '', '', ''
);

-- Pasien 2: Siti Nurhaliza
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111112',
  'authenticated', 'authenticated',
  'siti@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "pasien", "nama": "Siti Nurhaliza", "nik": "3201012345670002"}',
  NOW(), NOW(), '', '', '', ''
);

-- Pasien 3: Ahmad Rizki
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111113',
  'authenticated', 'authenticated',
  'ahmad@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "pasien", "nama": "Ahmad Rizki", "nik": "3201012345670003"}',
  NOW(), NOW(), '', '', '', ''
);

-- Admin: Dewi Administrasi
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'admin@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "nama": "Dewi Administrasi"}',
  NOW(), NOW(), '', '', '', ''
);

-- Perawat: Rina Perawati
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'perawat@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "perawat", "nama": "Rina Perawati"}',
  NOW(), NOW(), '', '', '', ''
);

-- Dokter: Dr. Hendra Wijaya
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'dokter@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "dokter", "nama": "Dr. Hendra Wijaya"}',
  NOW(), NOW(), '', '', '', ''
);

-- Apoteker: Farhan Farmasi
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '55555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated',
  'apoteker@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "apoteker", "nama": "Farhan Farmasi"}',
  NOW(), NOW(), '', '', '', ''
);

-- Kasir: Linda Kasir
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '66666666-6666-6666-6666-666666666666',
  'authenticated', 'authenticated',
  'kasir@klinik.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "kasir", "nama": "Linda Kasir"}',
  NOW(), NOW(), '', '', '', ''
);

-- ============================================
-- 1b. CREATE AUTH IDENTITIES (agar bisa login)
-- ============================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"pasien@klinik.com"}', 'email', '11111111-1111-1111-1111-111111111111', NOW(), NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111112', '{"sub":"11111111-1111-1111-1111-111111111112","email":"siti@klinik.com"}', 'email', '11111111-1111-1111-1111-111111111112', NOW(), NOW(), NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111113', '{"sub":"11111111-1111-1111-1111-111111111113","email":"ahmad@klinik.com"}', 'email', '11111111-1111-1111-1111-111111111113', NOW(), NOW(), NOW()),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"admin@klinik.com"}', 'email', '22222222-2222-2222-2222-222222222222', NOW(), NOW(), NOW()),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"perawat@klinik.com"}', 'email', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()),
(gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"dokter@klinik.com"}', 'email', '44444444-4444-4444-4444-444444444444', NOW(), NOW(), NOW()),
(gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '{"sub":"55555555-5555-5555-5555-555555555555","email":"apoteker@klinik.com"}', 'email', '55555555-5555-5555-5555-555555555555', NOW(), NOW(), NOW()),
(gen_random_uuid(), '66666666-6666-6666-6666-666666666666', '{"sub":"66666666-6666-6666-6666-666666666666","email":"kasir@klinik.com"}', 'email', '66666666-6666-6666-6666-666666666666', NOW(), NOW(), NOW());

-- ============================================
-- 2. PROFIL PASIEN (update extra fields — trigger already created basic entries)
-- ============================================
UPDATE pasien SET
  tanggal_lahir = '1990-05-15',
  alamat = 'Jl. Merdeka No. 10, Jakarta Selatan',
  no_hp = '081234567890',
  riwayat_kesehatan = 'Riwayat alergi: Penisilin'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

UPDATE pasien SET
  tanggal_lahir = '1988-08-22',
  alamat = 'Jl. Sudirman No. 25, Jakarta Pusat',
  no_hp = '081234567891',
  riwayat_kesehatan = 'Diabetes tipe 2 sejak 2020'
WHERE user_id = '11111111-1111-1111-1111-111111111112';

UPDATE pasien SET
  tanggal_lahir = '1995-12-03',
  alamat = 'Jl. Gatot Subroto No. 5, Jakarta Barat',
  no_hp = '081234567892'
WHERE user_id = '11111111-1111-1111-1111-111111111113';

-- ============================================
-- 3. PROFIL STAFF
-- ============================================
INSERT INTO admin (id_admin, user_id, nama, email) VALUES
(1, '22222222-2222-2222-2222-222222222222', 'Dewi Administrasi', 'admin@klinik.com');

SELECT setval('admin_id_admin_seq', 1);

INSERT INTO perawat (id_perawat, user_id, nama, no_hp) VALUES
(1, '33333333-3333-3333-3333-333333333333', 'Rina Perawati', '081345678901');

SELECT setval('perawat_id_perawat_seq', 1);

INSERT INTO dokter (id_dokter, user_id, nama, spesialis, no_hp) VALUES
(1, '44444444-4444-4444-4444-444444444444', 'Dr. Hendra Wijaya', 'Umum', '081456789012');

SELECT setval('dokter_id_dokter_seq', 1);

INSERT INTO kasir (id_kasir, user_id, nama, no_hp) VALUES
(1, '66666666-6666-6666-6666-666666666666', 'Linda Kasir', '081567890123');

SELECT setval('kasir_id_kasir_seq', 1);

-- ============================================
-- 4. JADWAL DOKTER & PERAWAT
-- ============================================
INSERT INTO jadwal (id_dokter, id_perawat, hari, jam_mulai, jam_selesai) VALUES
(1, 1, 'Senin',  '08:00', '12:00'),
(1, 1, 'Selasa', '08:00', '12:00'),
(1, 1, 'Rabu',   '13:00', '17:00'),
(1, 1, 'Kamis',  '08:00', '12:00'),
(1, 1, 'Jumat',  '08:00', '11:00');

-- ============================================
-- 5. FORM PENDAFTARAN (3 pasien, berbagai status)
-- ============================================
INSERT INTO form_pendaftaran (id_form, id_pasien, tanggal_daftar, keluhan, permintaan_khusus, status) VALUES
(1, 1, NOW() - INTERVAL '3 days', 'Demam tinggi dan batuk berdahak sudah 3 hari', NULL, 'verified'),
(2, 1, NOW() - INTERVAL '1 day', 'Sakit kepala berulang', 'Minta dokter wanita jika ada', 'verified'),
(3, 2, NOW() - INTERVAL '2 days', 'Kontrol gula darah rutin', 'Pagi saja', 'verified'),
(4, 2, NOW(), 'Nyeri sendi lutut kanan', NULL, 'pending'),
(5, 3, NOW() - INTERVAL '1 day', 'Batuk pilek biasa', NULL, 'verified'),
(6, 3, NOW(), 'Sakit perut setelah makan', NULL, 'pending');

SELECT setval('form_pendaftaran_id_form_seq', 6);

-- ============================================
-- 6. ANTRIAN
-- ============================================
INSERT INTO antrian (id_antrian, id_form, nomor_antrian, waktu_panggil, status, created_at) VALUES
(1, 1, 1, NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'done', NOW() - INTERVAL '3 days'),
(2, 2, 1, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 'done', NOW() - INTERVAL '1 day'),
(3, 3, 2, NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 'done', NOW() - INTERVAL '2 days'),
(4, 5, 1, NOW() - INTERVAL '1 day' + INTERVAL '1 hour', 'done', NOW() - INTERVAL '1 day'),
-- Antrian hari ini
(5, 2, 1, NULL, 'waiting', NOW()),
(6, 4, 2, NULL, 'waiting', NOW());

SELECT setval('antrian_id_antrian_seq', 6);

-- ============================================
-- 7. REKAM MEDIS
-- ============================================
INSERT INTO rekam_medis (id_rekam, id_pasien, id_dokter, id_perawat, tanggal_periksa, tekanan_darah, suhu, berat_badan, diagnosa, catatan, rujukan, kontrol_lanjutan) VALUES
(1, 1, 1, 1, NOW() - INTERVAL '3 days', '120/80', 38.5, 70, 'ISPA (Infeksi Saluran Pernapasan Atas)', 'Pasien demam 3 hari, batuk berdahak. Diberikan obat penurun panas dan antibiotik.', NULL, TRUE),
(2, 2, 1, 1, NOW() - INTERVAL '2 days', '130/85', 36.8, 65, 'Diabetes Mellitus Tipe 2 - Kontrol', 'Gula darah puasa: 180 mg/dL. Dosis Metformin tetap.', NULL, TRUE),
(3, 1, 1, 1, NOW() - INTERVAL '1 day', '118/78', 36.5, 70, 'Tension Headache', 'Sakit kepala berulang, kemungkinan karena stress kerja. Disarankan istirahat cukup.', NULL, FALSE),
(4, 3, 1, 1, NOW() - INTERVAL '1 day', '115/75', 37.2, 68, 'Common Cold', 'Batuk pilek ringan. Diberikan obat simptomatik.', NULL, FALSE);

SELECT setval('rekam_medis_id_rekam_seq', 4);

-- ============================================
-- 8. REMINDER KONTROL
-- ============================================
INSERT INTO reminder (id_pasien, id_rekam, tanggal_kontrol, status) VALUES
(1, 1, (NOW() + INTERVAL '7 days')::date, 'pending'),
(2, 2, (NOW() + INTERVAL '30 days')::date, 'pending');

-- ============================================
-- 9. RESEP OBAT
-- ============================================
INSERT INTO resep (id_resep, id_rekam, id_dokter, tanggal_resep, status) VALUES
(1, 1, 1, NOW() - INTERVAL '3 days', 'completed'),
(2, 2, 1, NOW() - INTERVAL '2 days', 'completed'),
(3, 3, 1, NOW() - INTERVAL '1 day', 'completed'),
(4, 4, 1, NOW() - INTERVAL '1 day', 'pending');

SELECT setval('resep_id_resep_seq', 4);

-- Detail resep 1 (ISPA - Budi)
INSERT INTO detail_resep (id_resep, id_obat, jumlah, dosis) VALUES
(1, 1, 10, '3x1 setelah makan'),   -- Paracetamol
(1, 2, 15, '3x1 setelah makan'),   -- Amoxicillin
(1, 7, 10, '1x1 pagi hari');       -- Vitamin C

-- Detail resep 2 (Diabetes - Siti)
INSERT INTO detail_resep (id_resep, id_obat, jumlah, dosis) VALUES
(2, 5, 30, '2x1 sebelum makan');   -- Metformin

-- Detail resep 3 (Headache - Budi)
INSERT INTO detail_resep (id_resep, id_obat, jumlah, dosis) VALUES
(3, 1, 10, '3x1 jika sakit'),      -- Paracetamol
(3, 7, 10, '1x1 pagi hari');       -- Vitamin C

-- Detail resep 4 (Cold - Ahmad, belum diproses)
INSERT INTO detail_resep (id_resep, id_obat, jumlah, dosis) VALUES
(4, 1, 10, '3x1 setelah makan'),   -- Paracetamol
(4, 4, 7,  '1x1 malam hari'),      -- Cetirizine
(4, 7, 10, '1x1 pagi hari');       -- Vitamin C

-- ============================================
-- 10. TRANSAKSI & PEMBAYARAN
-- ============================================
INSERT INTO transaksi (id_transaksi, id_pasien, id_rekam, tanggal_bayar, total_biaya, metode_pembayaran, status, id_kasir) VALUES
(1, 1, 1, NOW() - INTERVAL '3 days', 85000.00, 'tunai', 'paid', 1),
(2, 2, 2, NOW() - INTERVAL '2 days', 125000.00, 'transfer', 'paid', 1),
(3, 1, 3, NOW() - INTERVAL '1 day', 65000.00, 'kartu', 'paid', 1),
(4, 3, 4, NULL, 57000.00, NULL, 'draft', 1);

SELECT setval('transaksi_id_transaksi_seq', 4);

-- Rincian transaksi 1
INSERT INTO rincian_transaksi (id_transaksi, keterangan, biaya) VALUES
(1, 'Konsultasi dokter umum', 50000.00),
(1, 'Paracetamol 500mg x10', 15000.00),
(1, 'Amoxicillin 500mg x15', 52500.00),
(1, 'Vitamin C 500mg x10', 10000.00);

-- Rincian transaksi 2 (diskon, jadi beda dikit totalnya hehe)
INSERT INTO rincian_transaksi (id_transaksi, keterangan, biaya) VALUES
(2, 'Konsultasi dokter umum', 50000.00),
(2, 'Metformin 500mg x30', 75000.00);

-- Rincian transaksi 3
INSERT INTO rincian_transaksi (id_transaksi, keterangan, biaya) VALUES
(3, 'Konsultasi dokter umum', 50000.00),
(3, 'Paracetamol 500mg x10', 15000.00);

-- Rincian transaksi 4 (draft - belum bayar)
INSERT INTO rincian_transaksi (id_transaksi, keterangan, biaya) VALUES
(4, 'Konsultasi dokter umum', 50000.00),
(4, 'Paracetamol 500mg x10', 15000.00),
(4, 'Cetirizine 10mg x7', 14000.00),
(4, 'Vitamin C 500mg x10', 10000.00);

-- ============================================
-- 11. LAPORAN HARIAN
-- ============================================
INSERT INTO laporan (tanggal, jumlah_pasien, jumlah_transaksi, total_pendapatan, dibuat_oleh) VALUES
((NOW() - INTERVAL '3 days')::date, 5, 4, 450000.00, 1),
((NOW() - INTERVAL '2 days')::date, 3, 3, 275000.00, 1),
((NOW() - INTERVAL '1 day')::date, 4, 3, 320000.00, 1);

-- ============================================
-- 12. FEEDBACK
-- ============================================
INSERT INTO feedback (id_pasien, rating, komentar, tanggal_feedback) VALUES
(1, 5, 'Pelayanan sangat ramah dan cepat. Dokter menjelaskan dengan detail.', NOW() - INTERVAL '3 days'),
(2, 4, 'Antrian cukup cepat, obatnya lengkap. Ruang tunggu bisa lebih nyaman.', NOW() - INTERVAL '2 days'),
(1, 5, 'Seperti biasa pelayanan sangat baik. Terima kasih!', NOW() - INTERVAL '1 day'),
(3, 3, 'Agak lama menunggu, tapi dokternya bagus.', NOW() - INTERVAL '1 day');

-- ============================================
-- 13. PURCHASE REQUEST (Stok obat)
-- ============================================
INSERT INTO purchase_request (id_obat, jumlah_diminta, status, catatan, created_at) VALUES
(8, 50, 'approved', 'Stok Antasida menipis, perlu restock', NOW() - INTERVAL '2 days'),
(9, 30, 'pending', 'Salbutamol hampir habis', NOW() - INTERVAL '1 day'),
(10, 20, 'ordered', 'Diazepam stok rendah, sudah pesan ke distributor', NOW() - INTERVAL '3 days');

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================
INSERT INTO notifications (recipient_id, title, message, type, status, channel, sent_at, created_at) VALUES
-- Pasien notifications
('11111111-1111-1111-1111-111111111111', 'Antrian Anda Dipanggil', 'Nomor antrian 1 telah dipanggil. Silakan menuju ruang periksa.', 'antrian', 'sent', 'push', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'Resep Siap Diambil', 'Resep obat Anda telah selesai disiapkan. Silakan menuju apotek.', 'resep_ready', 'sent', 'push', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'Pembayaran Berhasil', 'Pembayaran Rp 85.000 telah berhasil. Terima kasih!', 'pembayaran_done', 'sent', 'push', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'Pengingat Kontrol', 'Jangan lupa kontrol kembali pada tanggal yang dijadwalkan.', 'kontrol_reminder', 'pending', 'push', NULL, NOW()),
('11111111-1111-1111-1111-111111111112', 'Antrian Anda Dipanggil', 'Nomor antrian 2 telah dipanggil. Silakan menuju ruang periksa.', 'antrian', 'sent', 'push', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111112', 'Pembayaran Berhasil', 'Pembayaran Rp 125.000 telah berhasil. Terima kasih!', 'pembayaran_done', 'sent', 'push', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
-- Apoteker notification
('55555555-5555-5555-5555-555555555555', 'Stok Obat Menipis', 'Stok Antasida Doen tersisa 90 unit, mendekati batas minimum.', 'stok_menipis', 'sent', 'push', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('55555555-5555-5555-5555-555555555555', 'Stok Obat Menipis', 'Stok Salbutamol 2mg tersisa 80 unit, mendekati batas minimum.', 'stok_menipis', 'pending', 'push', NULL, NOW());

-- ============================================
-- Update stok obat (karena sudah ada resep yang completed)
-- ============================================
UPDATE obat SET stok = stok - 20 WHERE id_obat = 1;  -- Paracetamol: 200 - 20 = 180
UPDATE obat SET stok = stok - 15 WHERE id_obat = 2;  -- Amoxicillin: 150 - 15 = 135
UPDATE obat SET stok = stok - 7  WHERE id_obat = 4;  -- Cetirizine: 180 - 7 = 173
UPDATE obat SET stok = stok - 30 WHERE id_obat = 5;  -- Metformin: 120 - 30 = 90
UPDATE obat SET stok = stok - 20 WHERE id_obat = 7;  -- Vitamin C: 250 - 20 = 230

-- ============================================================
-- DONE! Dummy data berhasil ditambahkan.
-- ============================================================
--
-- AKUN LOGIN:
-- +-------------------+--------------------+-------------+
-- | Email             | Password           | Role        |
-- +-------------------+--------------------+-------------+
-- | pasien@klinik.com | password123        | Pasien      |
-- | siti@klinik.com   | password123        | Pasien      |
-- | ahmad@klinik.com  | password123        | Pasien      |
-- | admin@klinik.com  | password123        | Admin       |
-- | perawat@klinik.com| password123        | Perawat     |
-- | dokter@klinik.com | password123        | Dokter      |
-- | apoteker@klinik.com| password123       | Apoteker    |
-- | kasir@klinik.com  | password123        | Kasir       |
-- +-------------------+--------------------+-------------+
--
-- DATA YANG DIBUAT:
-- - 8 user accounts (3 pasien + 5 staff)
-- - 3 profil pasien lengkap
-- - 6 form pendaftaran (4 verified, 2 pending)
-- - 6 antrian (4 done, 2 waiting hari ini)
-- - 4 rekam medis dengan vital signs & diagnosa
-- - 2 reminder kontrol
-- - 4 resep (3 completed, 1 pending)
-- - 10 detail resep
-- - 4 transaksi (3 paid, 1 draft)
-- - 11 rincian transaksi
-- - 3 laporan harian
-- - 4 feedback pasien
-- - 3 purchase request
-- - 8 notifikasi
-- ============================================================
