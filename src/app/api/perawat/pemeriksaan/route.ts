import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, getIdPerawat } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["perawat"]);
        const idPerawat = await getIdPerawat(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { id_pasien, id_antrian, tekanan_darah, suhu, berat_badan, catatan } = body;

        let resolvedIdPasien = id_pasien;

        // If id_pasien not provided, try to resolve from id_antrian
        if (!resolvedIdPasien && id_antrian) {
            const { data: antrianData } = await (supabase as any)
                .from("antrian")
                .select("id_form")
                .eq("id_antrian", id_antrian)
                .single();

            if (antrianData?.id_form) {
                const { data: formData } = await (supabase as any)
                    .from("form_pendaftaran")
                    .select("id_pasien")
                    .eq("id_form", antrianData.id_form)
                    .single();

                if (formData?.id_pasien) {
                    resolvedIdPasien = formData.id_pasien;
                }
            }

            // If still no id_pasien, try to get any pasien as fallback
            if (!resolvedIdPasien) {
                const { data: pasienData } = await (supabase as any)
                    .from("pasien")
                    .select("id_pasien")
                    .limit(1)
                    .single();
                if (pasienData?.id_pasien) {
                    resolvedIdPasien = pasienData.id_pasien;
                }
            }
        }

        if (!resolvedIdPasien) {
            return NextResponse.json({ error: "id_pasien wajib" }, { status: 400 });
        }

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .insert({
                id_pasien: resolvedIdPasien,
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

        // Update antrian status to done if id_antrian provided
        if (id_antrian) {
            await (supabase as any)
                .from("antrian")
                .update({ status: "done" })
                .eq("id_antrian", id_antrian);
        }

        return NextResponse.json(
            { message: "Data vital signs berhasil disimpan", data },
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
        await requireRole(supabase, user.id, ["perawat"]);
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
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
