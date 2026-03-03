import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getTodayRange } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);
        const { start, end } = getTodayRange();

        // Pending verifikasi count
        const { count: pendingVerifikasi } = await (supabase as any)
            .from("form_pendaftaran")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

        // Antrian hari ini (waiting + called)
        const { count: antrianHariIni } = await (supabase as any)
            .from("antrian")
            .select("*", { count: "exact", head: true })
            .in("status", ["waiting", "called"]);

        // Pasien hari ini (done)
        const { count: pasienHariIni } = await (supabase as any)
            .from("antrian")
            .select("*", { count: "exact", head: true })
            .eq("status", "done");

        // Pendapatan hari ini
        const { data: transaksiHariIni } = await (supabase as any)
            .from("transaksi")
            .select("total_biaya")
            .eq("status", "paid")
            .gte("tanggal_bayar", start)
            .lte("tanggal_bayar", end);

        const pendapatan = (transaksiHariIni || []).reduce(
            (sum: number, t: any) => sum + (t.total_biaya || 0),
            0
        );

        return NextResponse.json({
            pendingVerifikasi: pendingVerifikasi || 0,
            antrianHariIni: antrianHariIni || 0,
            pasienHariIni: pasienHariIni || 0,
            pendapatan,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
