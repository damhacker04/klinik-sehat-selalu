import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker"]);

        // Resep pending
        const { count: resepMasuk } = await (supabase as any)
            .from("resep")
            .select("*", { count: "exact", head: true })
            .in("status", ["pending", "processing"]);

        // Total obat
        const { count: totalObat } = await (supabase as any)
            .from("obat")
            .select("*", { count: "exact", head: true });

        // Stok menipis
        const { data: lowStockData } = await (supabase as any)
            .from("obat")
            .select("id_obat, stok, stok_minimum");

        const stokMenipis = (lowStockData || []).filter(
            (o: any) => o.stok <= o.stok_minimum
        ).length;

        // Pengadaan pending
        const { count: pengadaanPending } = await (supabase as any)
            .from("purchase_request")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

        return NextResponse.json({
            resepMasuk: resepMasuk || 0,
            totalObat: totalObat || 0,
            stokMenipis,
            pengadaanPending: pengadaanPending || 0,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
