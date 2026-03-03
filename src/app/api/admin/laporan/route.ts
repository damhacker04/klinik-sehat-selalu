import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getTodayRange } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);
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

        return NextResponse.json({
            jumlahPasien: jumlahPasien || 0,
            jumlahTransaksi: jumlahTransaksi || 0,
            totalPendapatan,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
