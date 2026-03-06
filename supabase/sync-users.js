const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otbspicsukhpvsgrwxej.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YnNwaWNzdWtocHZzZ3J3eGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMDkzNCwiZXhwIjoyMDg4MDc2OTM0fQ.P2xwXlda60uUdOPdUcKvQmLYRblGNdclnE7nbUSiITE';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function syncMissingUsers() {
    console.log("=== Starting Missing Auth Users Sync ===");

    // 1. Dapatkan semua User dari Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Gagal mendapatkan User Auth:", authError.message);
        return;
    }

    const authUsers = authData.users;
    console.log(`Ditemukan ${authUsers.length} user di sistem Auth Supabase.`);

    // 2. Dapatkan semua akun dari public.user_accounts
    const { data: dbAccounts, error: dbError } = await supabase.from('user_accounts').select('id, email');

    if (dbError) {
        console.error("Gagal membaca tabel user_accounts:", dbError.message);
        return;
    }

    const dbUserIds = new Set(dbAccounts.map(a => a.id));

    let syncedCount = 0;

    // 3. Cari dan Sinkronkan yang tertinggal
    for (const user of authUsers) {
        if (!dbUserIds.has(user.id)) {
            console.log(`\n⏳ Menemukan user belum sinkron: ${user.email} (ID: ${user.id})`);

            // Baca metadata untuk role dan NIK bila ada
            const role = user.user_metadata?.role || "admin"; // Default missing to Admin for client Adam
            const nama = user.user_metadata?.nama || user.email.split('@')[0];
            const nik = user.user_metadata?.nik || `SYNC-${user.id.slice(0, 8)}`;

            // Step A: Masukkan ke user_accounts
            const { error: insertUserError } = await supabase.from('user_accounts').insert({
                id: user.id,
                email: user.email,
                role: role,
                status: 'active'
            });

            if (insertUserError) {
                console.error(`❌ Gagal insert ke user_accounts:`, insertUserError.message);
                continue;
            }
            console.log(` ✅ Inserted: user_accounts (${role})`);

            // Step B: Masukkan ke tabel profil yang sesuai
            try {
                if (role === 'pasien') {
                    await supabase.from('pasien').insert({ user_id: user.id, nama, nik, email: user.email });
                } else if (role === 'admin') {
                    await supabase.from('admin').insert({ user_id: user.id, nama, email: user.email });
                } else if (role === 'dokter') {
                    await supabase.from('dokter').insert({ user_id: user.id, nama });
                } else if (role === 'perawat') {
                    await supabase.from('perawat').insert({ user_id: user.id, nama });
                } else if (role === 'kasir') {
                    await supabase.from('kasir').insert({ user_id: user.id, nama });
                } else if (role === 'apoteker') {
                    // There's no separate profile table, handled by role logic normally
                }

                console.log(` ✅ Inserted: profil tabel ${role}`);
                syncedCount++;
            } catch (roleError) {
                console.error(`❌ Gagal insert profil ${role}:`, roleError.message);
            }
        }
    }

    if (syncedCount === 0) {
        console.log("\n✨ Semua user sudah sinkron. Tidak ada aksi yang diperlukan.");
    } else {
        console.log(`\n🎉 Proses selesai. Berhasil mensinkronkan ${syncedCount} user.`);
    }
}

syncMissingUsers();
