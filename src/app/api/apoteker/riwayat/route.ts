import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker"]);

        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminSupabase = createAdminClient();

        const { data, error } = await (adminSupabase as any)
            .from("resep")
            .select("*, detail_resep(*, obat(nama_obat)), rekam_medis(pasien(nama), transaksi(status))")
            .in("status", ["completed", "rejected"])
            .order("tanggal_resep", { ascending: false });

        if (error) {
            console.error("Riwayat API Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("Riwayat API Data length:", data?.length);
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
