import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["dokter"]);

        // Pasien yang sudah diperiksa perawat (punya vital signs) tapi belum ada diagnosa
        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .select("*, pasien(nama)")
            .not("id_perawat", "is", null)
            .is("diagnosa", null)
            .order("tanggal_periksa", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Fetch keluhan dari form_pendaftaran terbaru untuk pasien tersebut
        const enriched = await Promise.all(
            (data || []).map(async (item: any) => {
                const { data: formData } = await (supabase as any)
                    .from("form_pendaftaran")
                    .select("keluhan")
                    .eq("id_pasien", item.id_pasien)
                    .order("tanggal_daftar", { ascending: false })
                    .limit(1)
                    .single();
                return { ...item, keluhan: formData?.keluhan || "-" };
            })
        );

        return NextResponse.json(enriched);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
