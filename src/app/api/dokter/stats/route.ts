import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        // Pasien yang sudah diperiksa perawat tapi belum dokter
        const { count: antrianPasien } = await (supabase as any)
            .from("rekam_medis")
            .select("*", { count: "exact", head: true })
            .not("id_perawat", "is", null)
            .is("diagnosa", null);

        // Pemeriksaan hari ini
        const { count: pemeriksaanHariIni } = await (supabase as any)
            .from("rekam_medis")
            .select("*", { count: "exact", head: true })
            .not("diagnosa", "is", null);

        // Resep dibuat hari ini
        const { count: resepDibuat } = await (supabase as any)
            .from("resep")
            .select("*", { count: "exact", head: true });

        // Kontrol lanjutan
        const { count: kontrolLanjutan } = await (supabase as any)
            .from("rekam_medis")
            .select("*", { count: "exact", head: true })
            .eq("kontrol_lanjutan", true);

        return NextResponse.json({
            antrianPasien: antrianPasien || 0,
            pemeriksaanHariIni: pemeriksaanHariIni || 0,
            resepDibuat: resepDibuat || 0,
            kontrolLanjutan: kontrolLanjutan || 0,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
