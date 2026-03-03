import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        // Antrian waiting
        const { count: antrianWaiting } = await (supabase as any)
            .from("antrian")
            .select("*", { count: "exact", head: true })
            .in("status", ["waiting", "called"]);

        // Sudah diperiksa hari ini (rekam_medis with perawat data today)
        const { count: sudahDiperiksa } = await (supabase as any)
            .from("rekam_medis")
            .select("*", { count: "exact", head: true })
            .not("tekanan_darah", "is", null);

        // Total pasien hari ini
        const { count: totalPasien } = await (supabase as any)
            .from("antrian")
            .select("*", { count: "exact", head: true });

        return NextResponse.json({
            antrianWaiting: antrianWaiting || 0,
            sudahDiperiksa: sudahDiperiksa || 0,
            totalPasien: totalPasien || 0,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
