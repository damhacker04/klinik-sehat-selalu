const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://otbspicsukhpvsgrwxej.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YnNwaWNzdWtocHZzZ3J3eGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwMDkzNCwiZXhwIjoyMDg4MDc2OTM0fQ.P2xwXlda60uUdOPdUcKvQmLYRblGNdclnE7nbUSiITE'
);

async function test() {
    const { data, error } = await supabase
        .from('antrian')
        .select('*, form_pendaftaran(id_pasien, keluhan, pasien(nama))');
    console.log(JSON.stringify(data[0], null, 2));
}

test();
