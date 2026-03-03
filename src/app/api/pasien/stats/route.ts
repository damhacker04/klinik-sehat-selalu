import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        // Count total kunjungan
        const { count: totalKunjungan } = await (supabase as any)
            .from("rekam_medis")
            .select("*", { count: "exact", head: true })
            .eq("id_pasien", idPasien);

        // Count total feedback
        const { count: totalFeedback } = await (supabase as any)
            .from("feedback")
            .select("*", { count: "exact", head: true })
            .eq("id_pasien", idPasien);

        // Get active pendaftaran (latest pending/verified)
        const { data: activePendaftaran } = await (supabase as any)
            .from("form_pendaftaran")
            .select("id_form, status, tanggal_daftar")
            .eq("id_pasien", idPasien)
            .in("status", ["pending", "verified"])
            .order("tanggal_daftar", { ascending: false })
            .limit(1);

        // Get active antrian using admin client (bypass RLS)
        // Query by form IDs linked to this patient
        let myAntrian = null;
        if (activePendaftaran && activePendaftaran.length > 0) {
            const formIds = activePendaftaran.map((f: any) => f.id_form);
            const adminSupabase = createAdminClient();
            const { data: antrianData } = await (adminSupabase as any)
                .from("antrian")
                .select("nomor_antrian, status")
                .in("id_form", formIds)
                .in("status", ["waiting", "called"])
                .order("nomor_antrian", { ascending: true })
                .limit(1);

            myAntrian = antrianData?.[0] || null;
        }

        return NextResponse.json({
            totalKunjungan: totalKunjungan || 0,
            totalFeedback: totalFeedback || 0,
            pendaftaranStatus: activePendaftaran?.[0]?.status || null,
            nomorAntrian: myAntrian?.nomor_antrian || null,
            antrianStatus: myAntrian?.status || null,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
