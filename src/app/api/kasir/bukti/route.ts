import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["kasir"]);
        const { searchParams } = new URL("http://localhost");
        const id = searchParams.get("id");

        if (id) {
            // Get specific transaction detail
            const { data, error } = await (supabase as any)
                .from("transaksi")
                .select("*, pasien(nama, nik, no_hp), rincian_transaksi(*)")
                .eq("id_transaksi", parseInt(id))
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        }

        // List all paid transactions (as receipts)
        const { data, error } = await (supabase as any)
            .from("transaksi")
            .select("*, pasien(nama), rincian_transaksi(*)")
            .eq("status", "paid")
            .order("tanggal_bayar", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
