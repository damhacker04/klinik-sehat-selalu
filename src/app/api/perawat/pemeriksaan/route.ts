import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPerawat } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPerawat = await getIdPerawat(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { id_pasien, tekanan_darah, suhu, berat_badan, catatan } = body;

        if (!id_pasien) {
            return NextResponse.json({ error: "id_pasien wajib" }, { status: 400 });
        }

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .insert({
                id_pasien,
                id_perawat: idPerawat,
                tekanan_darah: tekanan_darah || null,
                suhu: suhu || null,
                berat_badan: berat_badan || null,
                catatan: catatan || null,
                kontrol_lanjutan: false,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Data vital signs berhasil disimpan", data },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPerawat = await getIdPerawat(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .select("*, pasien(nama)")
            .eq("id_perawat", idPerawat)
            .order("tanggal_periksa", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
