import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

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

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
