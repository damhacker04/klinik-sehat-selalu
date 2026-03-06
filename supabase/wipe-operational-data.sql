-- ============================================================
-- SCRIPT TO WIPE OPERATIONAL DATA (DEVELOPMENT ONLY)
-- Keep user_accounts, pasien, admin, perawat, dokter, apoteker, kasir, obat
-- ============================================================

-- Disable foreign key checks for truncation
SET session_replication_role = replica;

-- Wipe patient interaction data
TRUNCATE TABLE form_pendaftaran CASCADE;
TRUNCATE TABLE antrian CASCADE;
TRUNCATE TABLE rekam_medis CASCADE;
TRUNCATE TABLE resep CASCADE;
TRUNCATE TABLE detail_resep CASCADE;
TRUNCATE TABLE transaksi CASCADE;
TRUNCATE TABLE rincian_transaksi CASCADE;
TRUNCATE TABLE reminder CASCADE;
TRUNCATE TABLE feedback CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE purchase_request CASCADE;
TRUNCATE TABLE laporan CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = default;

SELECT 'Operational data has been wiped successfully.' as result;
