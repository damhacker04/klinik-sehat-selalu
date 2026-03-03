-- ============================================================
-- KLINIK SEHAT SELALU - COMPLETE DATABASE SETUP
-- Jalankan SELURUH file ini di Supabase SQL Editor (1x saja)
-- ============================================================

-- ============================================================
-- PART 1: SCHEMA (Tables, ENUMs, Indexes, Triggers)
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS (PRD Section 8)
-- ============================================
CREATE TYPE user_role AS ENUM ('pasien', 'admin', 'perawat', 'dokter', 'apoteker', 'kasir');
CREATE TYPE form_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE antrian_status AS ENUM ('waiting', 'called', 'done');
CREATE TYPE resep_status AS ENUM ('pending', 'processing', 'completed');
CREATE TYPE transaksi_status AS ENUM ('draft', 'paid', 'failed', 'cancelled');
CREATE TYPE metode_pembayaran AS ENUM ('tunai', 'transfer', 'kartu');
CREATE TYPE notification_type AS ENUM ('antrian', 'resep_ready', 'pembayaran_done', 'kontrol_reminder', 'stok_menipis');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push');
CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'completed');
CREATE TYPE purchase_status AS ENUM ('pending', 'approved', 'ordered', 'received');

-- ============================================
-- 1. Authentication Service (Section 8.1)
-- ============================================
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'pasien',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT DEFAULT '[]'
);

INSERT INTO roles (name, permissions) VALUES
('pasien', '["read:own_profile", "read:own_records", "create:pendaftaran", "create:feedback"]'),
('admin', '["read:all", "write:verifikasi", "write:antrian", "write:jadwal", "read:reports"]'),
('perawat', '["read:patient_records", "write:vital_signs", "write:catatan"]'),
('dokter', '["read:patient_records", "write:diagnosa", "write:resep", "write:rujukan"]'),
('apoteker', '["read:resep", "write:stok", "write:purchase_request"]'),
('kasir', '["read:transaksi", "write:pembayaran", "write:receipt"]');

-- ============================================
-- 2. Patient Service (Section 8.2)
-- ============================================
CREATE TABLE pasien (
    id_pasien SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    tanggal_lahir DATE,
    alamat TEXT,
    no_hp VARCHAR(20),
    email VARCHAR(255),
    riwayat_kesehatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE form_pendaftaran (
    id_form SERIAL PRIMARY KEY,
    id_pasien INT NOT NULL REFERENCES pasien(id_pasien) ON DELETE CASCADE,
    tanggal_daftar TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    keluhan TEXT,
    permintaan_khusus TEXT,
    status form_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE antrian (
    id_antrian SERIAL PRIMARY KEY,
    id_form INT NOT NULL REFERENCES form_pendaftaran(id_form),
    nomor_antrian INT NOT NULL,
    waktu_panggil TIMESTAMPTZ,
    status antrian_status NOT NULL DEFAULT 'waiting',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feedback (
    id_feedback SERIAL PRIMARY KEY,
    id_pasien INT NOT NULL REFERENCES pasien(id_pasien) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    komentar TEXT,
    tanggal_feedback TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. Admin & Reporting Service (Section 8.3)
-- ============================================
CREATE TABLE admin (
    id_admin SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE
);

CREATE TABLE jadwal (
    id_jadwal SERIAL PRIMARY KEY,
    id_dokter INT,
    id_perawat INT,
    hari VARCHAR(20) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL
);

CREATE TABLE laporan (
    id_laporan SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jumlah_pasien INT DEFAULT 0,
    jumlah_transaksi INT DEFAULT 0,
    total_pendapatan DECIMAL(12, 2) DEFAULT 0,
    dibuat_oleh INT REFERENCES admin(id_admin),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. Medical Record Service (Section 8.4)
-- ============================================
CREATE TABLE dokter (
    id_dokter SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    spesialis VARCHAR(100),
    no_hp VARCHAR(20)
);

CREATE TABLE perawat (
    id_perawat SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20)
);

CREATE TABLE rekam_medis (
    id_rekam SERIAL PRIMARY KEY,
    id_pasien INT NOT NULL,
    id_dokter INT REFERENCES dokter(id_dokter),
    id_perawat INT REFERENCES perawat(id_perawat),
    tanggal_periksa TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tekanan_darah VARCHAR(20),
    suhu FLOAT CHECK (suhu IS NULL OR (suhu >= 30.0 AND suhu <= 45.0)),
    berat_badan FLOAT CHECK (berat_badan IS NULL OR (berat_badan >= 0.5 AND berat_badan <= 500)),
    diagnosa TEXT,
    catatan TEXT,
    rujukan TEXT,
    kontrol_lanjutan BOOLEAN DEFAULT FALSE
);

CREATE TABLE reminder (
    id_reminder SERIAL PRIMARY KEY,
    id_rekam INT NOT NULL REFERENCES rekam_medis(id_rekam),
    id_pasien INT NOT NULL,
    tanggal_kontrol DATE NOT NULL,
    status reminder_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. Pharmacy Service (Section 8.5)
-- ============================================
CREATE TABLE obat (
    id_obat SERIAL PRIMARY KEY,
    nama_obat VARCHAR(255) NOT NULL,
    stok INT NOT NULL DEFAULT 0 CHECK (stok >= 0),
    harga DECIMAL(10, 2) NOT NULL CHECK (harga > 0),
    satuan VARCHAR(50),
    stok_minimum INT NOT NULL DEFAULT 10 CHECK (stok_minimum >= 0)
);

CREATE TABLE resep (
    id_resep SERIAL PRIMARY KEY,
    id_rekam INT NOT NULL,
    id_dokter INT NOT NULL,
    tanggal_resep TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status resep_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE detail_resep (
    id_detail SERIAL PRIMARY KEY,
    id_resep INT NOT NULL REFERENCES resep(id_resep) ON DELETE CASCADE,
    id_obat INT NOT NULL REFERENCES obat(id_obat),
    jumlah INT NOT NULL CHECK (jumlah > 0),
    dosis VARCHAR(100)
);

CREATE TABLE purchase_request (
    id_request SERIAL PRIMARY KEY,
    id_obat INT NOT NULL REFERENCES obat(id_obat),
    jumlah_diminta INT NOT NULL CHECK (jumlah_diminta > 0),
    status purchase_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    catatan TEXT
);

-- ============================================
-- 6. Billing Service (Section 8.6)
-- ============================================
CREATE TABLE kasir (
    id_kasir SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20)
);

CREATE TABLE transaksi (
    id_transaksi SERIAL PRIMARY KEY,
    id_pasien INT NOT NULL,
    id_rekam INT,
    tanggal_bayar TIMESTAMPTZ,
    total_biaya DECIMAL(12, 2) NOT NULL DEFAULT 0,
    metode_pembayaran metode_pembayaran,
    status transaksi_status NOT NULL DEFAULT 'draft',
    id_kasir INT NOT NULL REFERENCES kasir(id_kasir)
);

CREATE TABLE rincian_transaksi (
    id_rincian SERIAL PRIMARY KEY,
    id_transaksi INT NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    keterangan TEXT,
    biaya DECIMAL(10, 2) NOT NULL CHECK (biaya > 0)
);

-- ============================================
-- 7. Notification Service (Section 8.7)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES user_accounts(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type,
    status notification_status NOT NULL DEFAULT 'pending',
    channel notification_channel DEFAULT 'push',
    retry_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_role ON user_accounts(role);
CREATE INDEX idx_pasien_user_id ON pasien(user_id);
CREATE INDEX idx_pasien_nik ON pasien(nik);
CREATE INDEX idx_form_pendaftaran_pasien ON form_pendaftaran(id_pasien);
CREATE INDEX idx_form_pendaftaran_status ON form_pendaftaran(status);
CREATE INDEX idx_antrian_form ON antrian(id_form);
CREATE INDEX idx_antrian_status ON antrian(status);
CREATE INDEX idx_antrian_created ON antrian(created_at);
CREATE INDEX idx_rekam_medis_pasien ON rekam_medis(id_pasien);
CREATE INDEX idx_rekam_medis_dokter ON rekam_medis(id_dokter);
CREATE INDEX idx_rekam_medis_tanggal ON rekam_medis(tanggal_periksa);
CREATE INDEX idx_resep_rekam ON resep(id_rekam);
CREATE INDEX idx_resep_status ON resep(status);
CREATE INDEX idx_detail_resep_resep ON detail_resep(id_resep);
CREATE INDEX idx_obat_stok ON obat(stok);
CREATE INDEX idx_transaksi_pasien ON transaksi(id_pasien);
CREATE INDEX idx_transaksi_status ON transaksi(status);
CREATE INDEX idx_transaksi_tanggal ON transaksi(tanggal_bayar);
CREATE INDEX idx_rincian_transaksi ON rincian_transaksi(id_transaksi);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_reminder_pasien ON reminder(id_pasien);
CREATE INDEX idx_reminder_status ON reminder(status);
CREATE INDEX idx_jadwal_dokter ON jadwal(id_dokter);
CREATE INDEX idx_jadwal_hari ON jadwal(hari);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_accounts_updated_at
    BEFORE UPDATE ON user_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user_accounts + pasien profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role public.user_role;
BEGIN
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'pasien')::public.user_role;

    -- 1. Create user_accounts entry
    INSERT INTO public.user_accounts (id, email, role, status)
    VALUES (NEW.id, NEW.email, _role, 'active');

    -- 2. Auto-create pasien profile if role = pasien AND nik is provided
    IF _role = 'pasien' AND COALESCE(NEW.raw_user_meta_data->>'nik', '') != '' THEN
        INSERT INTO public.pasien (user_id, nama, nik, email)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'nik',
            NEW.email
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PART 2: ROW LEVEL SECURITY (RLS Policies)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pasien ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE antrian ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokter ENABLE ROW LEVEL SECURITY;
ALTER TABLE perawat ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekam_medis ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder ENABLE ROW LEVEL SECURITY;
ALTER TABLE obat ENABLE ROW LEVEL SECURITY;
ALTER TABLE resep ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_resep ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasir ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE rincian_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.user_accounts WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, auth;

-- USER_ACCOUNTS policies
CREATE POLICY "Users can view own account"
    ON user_accounts FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admin can view all accounts"
    ON user_accounts FOR SELECT
    USING (get_user_role() = 'admin');

CREATE POLICY "Admin can update accounts"
    ON user_accounts FOR UPDATE
    USING (get_user_role() = 'admin');

-- PASIEN policies
CREATE POLICY "Pasien can view own profile"
    ON pasien FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Pasien can insert own profile"
    ON pasien FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pasien can update own profile"
    ON pasien FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view all patients"
    ON pasien FOR SELECT
    USING (get_user_role() IN ('admin', 'perawat', 'dokter', 'apoteker', 'kasir'));

-- FORM_PENDAFTARAN policies
CREATE POLICY "Pasien can view own forms"
    ON form_pendaftaran FOR SELECT
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Pasien can create forms"
    ON form_pendaftaran FOR INSERT
    WITH CHECK (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Admin can view all forms"
    ON form_pendaftaran FOR SELECT
    USING (get_user_role() = 'admin');

CREATE POLICY "Admin can update forms"
    ON form_pendaftaran FOR UPDATE
    USING (get_user_role() = 'admin');

-- ANTRIAN policies
CREATE POLICY "Pasien can view own queue"
    ON antrian FOR SELECT
    USING (id_form IN (
        SELECT id_form FROM form_pendaftaran
        WHERE id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid())
    ));

CREATE POLICY "Admin can manage queue"
    ON antrian FOR ALL
    USING (get_user_role() = 'admin');

CREATE POLICY "Staff can view queue"
    ON antrian FOR SELECT
    USING (get_user_role() IN ('perawat', 'dokter'));

-- FEEDBACK policies
CREATE POLICY "Pasien can manage own feedback"
    ON feedback FOR ALL
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Admin can view all feedback"
    ON feedback FOR SELECT
    USING (get_user_role() = 'admin');

-- ADMIN policies
CREATE POLICY "Admin can view admin profiles"
    ON admin FOR SELECT
    USING (get_user_role() = 'admin');

-- JADWAL policies
CREATE POLICY "Anyone authenticated can view jadwal"
    ON jadwal FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage jadwal"
    ON jadwal FOR ALL
    USING (get_user_role() = 'admin');

-- LAPORAN policies
CREATE POLICY "Admin can manage laporan"
    ON laporan FOR ALL
    USING (get_user_role() = 'admin');

-- DOKTER policies
CREATE POLICY "Dokter can view own profile"
    ON dokter FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view all dokter"
    ON dokter FOR SELECT
    USING (get_user_role() IN ('admin', 'perawat', 'dokter', 'apoteker', 'kasir'));

-- PERAWAT policies
CREATE POLICY "Perawat can view own profile"
    ON perawat FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view all perawat"
    ON perawat FOR SELECT
    USING (get_user_role() IN ('admin', 'perawat', 'dokter'));

-- REKAM_MEDIS policies
CREATE POLICY "Pasien can view own records"
    ON rekam_medis FOR SELECT
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Medical staff can view all records"
    ON rekam_medis FOR SELECT
    USING (get_user_role() IN ('perawat', 'dokter'));

CREATE POLICY "Perawat can insert records"
    ON rekam_medis FOR INSERT
    WITH CHECK (get_user_role() = 'perawat');

CREATE POLICY "Medical staff can update records"
    ON rekam_medis FOR UPDATE
    USING (get_user_role() IN ('perawat', 'dokter'));

-- REMINDER policies
CREATE POLICY "Pasien can view own reminders"
    ON reminder FOR SELECT
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Dokter can manage reminders"
    ON reminder FOR ALL
    USING (get_user_role() = 'dokter');

-- OBAT policies
CREATE POLICY "Apoteker can manage obat"
    ON obat FOR ALL
    USING (get_user_role() = 'apoteker');

CREATE POLICY "Staff can view obat"
    ON obat FOR SELECT
    USING (get_user_role() IN ('dokter', 'admin'));

-- RESEP & DETAIL_RESEP policies
CREATE POLICY "Dokter can create resep"
    ON resep FOR INSERT
    WITH CHECK (get_user_role() = 'dokter');

CREATE POLICY "Dokter can view resep"
    ON resep FOR SELECT
    USING (get_user_role() = 'dokter');

CREATE POLICY "Apoteker can manage resep"
    ON resep FOR ALL
    USING (get_user_role() = 'apoteker');

CREATE POLICY "Dokter can manage detail_resep"
    ON detail_resep FOR ALL
    USING (get_user_role() = 'dokter');

CREATE POLICY "Apoteker can view detail_resep"
    ON detail_resep FOR SELECT
    USING (get_user_role() = 'apoteker');

-- PURCHASE_REQUEST policies
CREATE POLICY "Apoteker can manage purchase requests"
    ON purchase_request FOR ALL
    USING (get_user_role() = 'apoteker');

CREATE POLICY "Admin can view purchase requests"
    ON purchase_request FOR SELECT
    USING (get_user_role() = 'admin');

-- KASIR policies
CREATE POLICY "Kasir can view own profile"
    ON kasir FOR SELECT
    USING (user_id = auth.uid());

-- TRANSAKSI & RINCIAN_TRANSAKSI policies
CREATE POLICY "Kasir can manage transaksi"
    ON transaksi FOR ALL
    USING (get_user_role() = 'kasir');

CREATE POLICY "Pasien can view own transaksi"
    ON transaksi FOR SELECT
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Kasir can manage rincian_transaksi"
    ON rincian_transaksi FOR ALL
    USING (get_user_role() = 'kasir');

CREATE POLICY "Pasien can view own rincian"
    ON rincian_transaksi FOR SELECT
    USING (id_transaksi IN (
        SELECT id_transaksi FROM transaksi
        WHERE id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid())
    ));

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update notifications"
    ON notifications FOR UPDATE
    USING (true);

-- ============================================================
-- PART 3: SEED DATA
-- ============================================================

INSERT INTO obat (nama_obat, stok, harga, satuan, stok_minimum) VALUES
('Paracetamol 500mg', 200, 1500.00, 'tablet', 20),
('Amoxicillin 500mg', 150, 3500.00, 'kapsul', 15),
('Omeprazole 20mg', 100, 5000.00, 'kapsul', 10),
('Cetirizine 10mg', 180, 2000.00, 'tablet', 15),
('Metformin 500mg', 120, 2500.00, 'tablet', 10),
('Ibuprofen 400mg', 160, 2000.00, 'tablet', 15),
('Vitamin C 500mg', 250, 1000.00, 'tablet', 25),
('Antasida Doen', 90, 3000.00, 'botol', 10),
('Salbutamol 2mg', 80, 4000.00, 'tablet', 10),
('Diazepam 5mg', 50, 6000.00, 'tablet', 5);

-- ============================================================
-- DONE! Semua tabel, policies, dan seed data telah dibuat.
-- ============================================================
