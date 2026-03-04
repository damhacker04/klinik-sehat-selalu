import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole, getTodayRange } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["kasir"]);
        const { start, end } = getTodayRange();

        // Menunggu bayar (draft)
        const { count: menungguBayar } = await (supabase as any)
            .from("transaksi")
            .select("*", { count: "exact", head: true })
            .eq("status", "draft");

        // Transaksi hari ini (paid)
        const { count: transaksiHariIni } = await (supabase as any)
            .from("transaksi")
            .select("*", { count: "exact", head: true })
            .eq("status", "paid")
            .gte("tanggal_bayar", start)
            .lte("tanggal_bayar", end);

        // Total pendapatan
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

        // Bukti hari ini
        const { count: buktiHariIni } = await (supabase as any)
            .from("transaksi")
            .select("*", { count: "exact", head: true })
            .eq("status", "paid")
            .gte("tanggal_bayar", start)
            .lte("tanggal_bayar", end);

        return NextResponse.json({
            menungguBayar: menungguBayar || 0,
            transaksiHariIni: transaksiHariIni || 0,
            totalPendapatan,
            buktiHariIni: buktiHariIni || 0,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
