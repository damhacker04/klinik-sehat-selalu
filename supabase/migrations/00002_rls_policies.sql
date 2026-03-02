-- ============================================
-- Row Level Security Policies
-- PRD v3.0 - RBAC for 6 roles (Section 14.1)
-- ============================================

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

-- ============================================
-- Helper function: get current user's role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM user_accounts WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- USER_ACCOUNTS
-- ============================================
CREATE POLICY "Users can view own account"
    ON user_accounts FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admin can view all accounts"
    ON user_accounts FOR SELECT
    USING (get_user_role() = 'admin');

CREATE POLICY "Admin can update accounts"
    ON user_accounts FOR UPDATE
    USING (get_user_role() = 'admin');

-- ============================================
-- PASIEN
-- ============================================
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

-- ============================================
-- FORM_PENDAFTARAN
-- ============================================
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

-- ============================================
-- ANTRIAN
-- ============================================
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

-- ============================================
-- FEEDBACK
-- ============================================
CREATE POLICY "Pasien can manage own feedback"
    ON feedback FOR ALL
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Admin can view all feedback"
    ON feedback FOR SELECT
    USING (get_user_role() = 'admin');

-- ============================================
-- ADMIN
-- ============================================
CREATE POLICY "Admin can view admin profiles"
    ON admin FOR SELECT
    USING (get_user_role() = 'admin');

-- ============================================
-- JADWAL
-- ============================================
CREATE POLICY "Anyone authenticated can view jadwal"
    ON jadwal FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage jadwal"
    ON jadwal FOR ALL
    USING (get_user_role() = 'admin');

-- ============================================
-- LAPORAN
-- ============================================
CREATE POLICY "Admin can manage laporan"
    ON laporan FOR ALL
    USING (get_user_role() = 'admin');

-- ============================================
-- DOKTER
-- ============================================
CREATE POLICY "Dokter can view own profile"
    ON dokter FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view all dokter"
    ON dokter FOR SELECT
    USING (get_user_role() IN ('admin', 'perawat', 'dokter', 'apoteker', 'kasir'));

-- ============================================
-- PERAWAT
-- ============================================
CREATE POLICY "Perawat can view own profile"
    ON perawat FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view all perawat"
    ON perawat FOR SELECT
    USING (get_user_role() IN ('admin', 'perawat', 'dokter'));

-- ============================================
-- REKAM_MEDIS
-- ============================================
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

-- ============================================
-- REMINDER
-- ============================================
CREATE POLICY "Pasien can view own reminders"
    ON reminder FOR SELECT
    USING (id_pasien IN (SELECT id_pasien FROM pasien WHERE user_id = auth.uid()));

CREATE POLICY "Dokter can manage reminders"
    ON reminder FOR ALL
    USING (get_user_role() = 'dokter');

-- ============================================
-- OBAT
-- ============================================
CREATE POLICY "Apoteker can manage obat"
    ON obat FOR ALL
    USING (get_user_role() = 'apoteker');

CREATE POLICY "Staff can view obat"
    ON obat FOR SELECT
    USING (get_user_role() IN ('dokter', 'admin'));

-- ============================================
-- RESEP & DETAIL_RESEP
-- ============================================
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

-- ============================================
-- PURCHASE_REQUEST
-- ============================================
CREATE POLICY "Apoteker can manage purchase requests"
    ON purchase_request FOR ALL
    USING (get_user_role() = 'apoteker');

CREATE POLICY "Admin can view purchase requests"
    ON purchase_request FOR SELECT
    USING (get_user_role() = 'admin');

-- ============================================
-- KASIR
-- ============================================
CREATE POLICY "Kasir can view own profile"
    ON kasir FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- TRANSAKSI & RINCIAN_TRANSAKSI
-- ============================================
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

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);  -- Controlled via service role

CREATE POLICY "System can update notifications"
    ON notifications FOR UPDATE
    USING (true);  -- Controlled via service role
