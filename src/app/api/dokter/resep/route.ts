import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdDokter, requireRole } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["dokter"]);
        const idDokter = await getIdDokter(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { id_rekam, items } = body;

        if (!id_rekam || !items || items.length === 0) {
            return NextResponse.json(
                { error: "id_rekam dan items wajib" },
                { status: 400 }
            );
        }

        // Create resep
        const { data: resep, error: resepError } = await (supabase as any)
            .from("resep")
            .insert({
                id_rekam,
                id_dokter: idDokter,
                status: "pending",
            })
            .select()
            .single();

        if (resepError) {
            return NextResponse.json({ error: resepError.message }, { status: 500 });
        }

        // Create detail resep
        const details = items.map((item: any) => ({
            id_resep: resep.id_resep,
            id_obat: item.id_obat,
            jumlah: item.jumlah,
            dosis: item.dosis || null,
        }));

        const { error: detailError } = await (supabase as any)
            .from("detail_resep")
            .insert(details);

        if (detailError) {
            return NextResponse.json({ error: detailError.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Resep berhasil dibuat", data: resep },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["dokter"]);
        const idDokter = await getIdDokter(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        const { data, error } = await (supabase as any)
            .from("resep")
            .select("*, detail_resep(*, obat(nama_obat, harga)), rekam_medis(pasien(nama))")
            .eq("id_dokter", idDokter)
            .order("tanggal_resep", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
