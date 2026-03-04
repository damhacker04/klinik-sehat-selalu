import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, getTodayRange } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);
        const { start, end } = getTodayRange();

        // Jumlah pasien hari ini
        const { count: jumlahPasien } = await (supabase as any)
            .from("antrian")
            .select("*", { count: "exact", head: true })
            .eq("status", "done");

        // Jumlah transaksi hari ini
        const { count: jumlahTransaksi } = await (supabase as any)
            .from("transaksi")
            .select("*", { count: "exact", head: true })
            .eq("status", "paid")
            .gte("tanggal_bayar", start)
            .lte("tanggal_bayar", end);

        // Total pendapatan hari ini
        const { data: transaksiData } = await (supabase as any)
            .from("transaksi")
            .select("total_biaya")
            .eq("status", "paid")
            .gte("tanggal_bayar", start)
            .lte("tanggal_bayar", end);

        const totalPendapatan = (transaksiData || []).reduce(
            (sum: number, t: any) => sum + (t.total_biaya || 0),
            0
        );

        // Weekly chart data — last 7 days
        const HARI_LABEL = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const wibOffset = 7 * 60 * 60 * 1000;
        const weeklyPasien = [];
        const weeklyPendapatan = [];

        for (let i = 6; i >= 0; i--) {
            const now = new Date();
            const wibNow = new Date(now.getTime() + wibOffset);
            const target = new Date(wibNow);
            target.setUTCDate(target.getUTCDate() - i);
            const dayStart = new Date(target);
            dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(target);
            dayEnd.setUTCHours(23, 59, 59, 999);
            const dStart = new Date(dayStart.getTime() - wibOffset).toISOString();
            const dEnd = new Date(dayEnd.getTime() - wibOffset).toISOString();
            const dayIndex = target.getUTCDay();

            const { count: pasienCount } = await (supabase as any)
                .from("antrian")
                .select("*", { count: "exact", head: true })
                .eq("status", "done")
                .gte("created_at", dStart)
                .lte("created_at", dEnd);

            const { data: dayTransaksi } = await (supabase as any)
                .from("transaksi")
                .select("total_biaya")
                .eq("status", "paid")
                .gte("tanggal_bayar", dStart)
                .lte("tanggal_bayar", dEnd);

            const dayPendapatan = (dayTransaksi || []).reduce(
                (s: number, t: any) => s + (t.total_biaya || 0), 0
            );

            weeklyPasien.push({ hari: HARI_LABEL[dayIndex], pasien: pasienCount || 0 });
            weeklyPendapatan.push({ hari: HARI_LABEL[dayIndex], pendapatan: dayPendapatan });
        }

        return NextResponse.json({
            jumlahPasien: jumlahPasien || 0,
            jumlahTransaksi: jumlahTransaksi || 0,
            totalPendapatan,
            weeklyPasien,
            weeklyPendapatan,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
