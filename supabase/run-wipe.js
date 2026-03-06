const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otbspicsukhpvsgrwxej.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YnNwaWNzdWtocHZzZ3J3eGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMDkzNCwiZXhwIjoyMDg4MDc2OTM0fQ.P2xwXlda60uUdOPdUcKvQmLYRblGNdclnE7nbUSiITE';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function wipeOperationalData() {
    console.log("Starting data wipe...");
    const tables = [
        "laporan",
        "purchase_request",
        "notifications",
        "feedback",
        "reminder",
        "rincian_transaksi",
        "transaksi",
        "detail_resep",
        "resep",
        "rekam_medis",
        "antrian",
        "form_pendaftaran"
    ];

    for (const table of tables) {
        console.log(`Wiping ${table}...`);
        const { error } = await supabase.from(table).delete().neq('id_' + (table.split('_')[0] === 'form' ? 'form' : table.includes('transaksi') && table !== 'rincian_transaksi' ? 'transaksi' : table === 'purchase_request' ? 'request' : table === 'rincian_transaksi' ? 'rincian' : table === 'detail_resep' ? 'detail' : table === 'rekam_medis' ? 'rekam' : table), 0);
        // Supabase REST block delete without filters. So we delete where ID != 0 (which deletes everything)
        if (error) {
            // Fallback if ID column name differs
            const { error: err2 } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (err2) {
                console.log(`Fallback 2 for ${table}...`);
                // Another fallback - just delete where created_at is not null
                const { error: err3 } = await supabase.from(table).delete().not('created_at', 'is', 'null');
                if (err3) console.error(`Failed wiping ${table}:`, error.message, err2.message, err3.message);
                else console.log(`Wiped ${table} successfully via fallback 2.`);
            } else {
                console.log(`Wiped ${table} successfully via fallback 1.`);
            }
        } else {
            console.log(`Wiped ${table} successfully.`);
        }
    }
    console.log("Operational data wiped.");
}

wipeOperationalData();
