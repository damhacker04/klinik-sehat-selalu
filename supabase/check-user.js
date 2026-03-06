const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otbspicsukhpvsgrwxej.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YnNwaWNzdWtocHZzZ3J3eGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMDkzNCwiZXhwIjoyMDg4MDc2OTM0fQ.P2xwXlda60uUdOPdUcKvQmLYRblGNdclnE7nbUSiITE';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUser(email) {
    console.log(`Checking email: ${email}`);

    // Check in user_accounts table first (which syncs from auth.users)
    const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error querying database:", error.message);
        return;
    }

    if (data) {
        console.log("✅ User ditemukan di database klinik (user_accounts):");
        console.log(`   - ID: ${data.id}`);
        console.log(`   - Role: ${data.role}`);
        console.log(`   - Status: ${data.status}`);

        // Let's also check if they have a specific role profile like pasien, dokter, etc.
        const profiles = ["pasien", "dokter", "perawat", "admin", "kasir", "apoteker"];
        for (let profile of profiles) {
            const { data: prof } = await supabase.from(profile).select('*').eq('user_id', data.id).single();
            if (prof) {
                console.log(`\n   * Profil Ditemukan di tabel '${profile}':`);
                console.log(`     Data: ${JSON.stringify(prof)}`);
            }
        }
    } else {
        console.log("❌ Email tersebut BELUM terdaftar di database klinik (tabel user_accounts).");

        // Let's check Supabase Auth just in case
        console.log("\nMengecek tabel internal Supabase Auth (auth.users)...");
        const { data: authUsers, error: err2 } = await supabase.auth.admin.listUsers();
        if (err2) {
            console.error("   Akses ke Auth API dibatasi.");
        } else {
            const user = authUsers.users.find(u => u.email === email);
            if (user) {
                console.log("   ✅ User ADA di auth Supabase list tapi tidak sinkron dengan user_accounts.");
            } else {
                console.log("   ❌ User JUGA TIDAK ADA di sistem autentikasi Supabase.");
            }
        }
    }
}

checkUser('adamemier16@gmail.com');
