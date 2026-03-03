import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getTodayRange } from "@/lib/supabase/queries";

function getDayRange(daysAgo: number) {
    const wibOffset = 7 * 60 * 60 * 1000;
    const now = new Date();
    const wibNow = new Date(now.getTime() + wibOffset);
    const target = new Date(wibNow);
    target.setUTCDate(target.getUTCDate() - daysAgo);
    const startOfDay = new Date(target);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(target);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return {
        start: new Date(startOfDay.getTime() - wibOffset).toISOString(),
        end: new Date(endOfDay.getTime() - wibOffset).toISOString(),
    };
}

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

        // Weekly stats — last 7 days
        const HARI_LABEL = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const weeklyStats = [];
        for (let i = 6; i >= 0; i--) {
            const range = getDayRange(i);
            const [doneRes, antrianRes] = await Promise.all([
                (supabase as any)
                    .from("antrian")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "done")
                    .gte("created_at", range.start)
                    .lte("created_at", range.end),
                (supabase as any)
                    .from("antrian")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", range.start)
                    .lte("created_at", range.end),
            ]);

            const wibOffset = 7 * 60 * 60 * 1000;
            const targetDate = new Date(new Date().getTime() + wibOffset);
            targetDate.setUTCDate(targetDate.getUTCDate() - i);
            const dayIndex = targetDate.getUTCDay(); // 0=Sun

            weeklyStats.push({
                hari: HARI_LABEL[dayIndex],
                pasien: doneRes.count || 0,
                antrian: antrianRes.count || 0,
            });
        }

        return NextResponse.json({
            pendingVerifikasi: pendingVerifikasi || 0,
            antrianHariIni: antrianHariIni || 0,
            pasienHariIni: pasienHariIni || 0,
            pendapatan,
            weeklyStats,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
