import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdDokter } from "@/lib/supabase/queries";

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idDokter = await getIdDokter(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { id_rekam, diagnosa, catatan, rujukan, kontrol_lanjutan } = body;

        if (!id_rekam || !diagnosa) {
            return NextResponse.json(
                { error: "id_rekam dan diagnosa wajib" },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .update({
                id_dokter: idDokter,
                diagnosa,
                catatan: catatan || null,
                rujukan: rujukan || null,
                kontrol_lanjutan: kontrol_lanjutan || false,
            })
            .eq("id_rekam", id_rekam)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If kontrol_lanjutan, create reminder
        if (kontrol_lanjutan && body.tanggal_kontrol) {
            await (supabase as any).from("reminder").insert({
                id_rekam,
                id_pasien: data.id_pasien,
                tanggal_kontrol: body.tanggal_kontrol,
                status: "pending",
            });
        }

        return NextResponse.json({ message: "Diagnosis berhasil disimpan", data });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
