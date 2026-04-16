import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, {
            email: user.email,
            nama: user.user_metadata?.nama,
        });

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .select(
                "*, dokter(nama, spesialisasi), resep(id_resep, status, tanggal_resep, detail_resep(jumlah, dosis, obat(nama_obat, satuan, jenis)))"
            )
            .eq("id_rekam", id)
            .eq("id_pasien", idPasien)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
