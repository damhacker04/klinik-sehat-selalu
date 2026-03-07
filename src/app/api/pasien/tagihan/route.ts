import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPasien, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["pasien"]);
        const idPasien = await getIdPasien(supabase, user.id);

        const { data, error } = await (supabase as any)
            .from("transaksi")
            .select("*, rincian_transaksi(*), rekam_medis(tanggal_periksa, dokter(nama))")
            .eq("id_pasien", idPasien)
            .order("id_transaksi", { ascending: false });

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

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["pasien"]);
        const idPasien = await getIdPasien(supabase, user.id);
        const body = await request.json();
        const { id_transaksi, metode_pembayaran } = body;

        if (!id_transaksi || !metode_pembayaran) {
            return NextResponse.json(
                { error: "id_transaksi dan metode_pembayaran wajib" },
                { status: 400 }
            );
        }

        // Verify that the transaction belongs to this Pasien and is still drafting
        const { data: trans, error: checkError } = await (supabase as any)
            .from("transaksi")
            .select("id_pasien, status")
            .eq("id_transaksi", id_transaksi)
            .single();

        if (checkError || !trans) {
            return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
        }

        if (trans.id_pasien !== idPasien) {
            return NextResponse.json({ error: "Bukan transaksi Anda" }, { status: 403 });
        }

        if (trans.status === "paid") {
            return NextResponse.json({ error: "Transaksi ini sudah lunas" }, { status: 400 });
        }

        const { createAdminClient } = await import("@/lib/supabase/admin");
        const adminSupabase = createAdminClient();

        const { error } = await (adminSupabase as any)
            .from("transaksi")
            .update({
                status: "paid",
                metode_pembayaran,
                tanggal_bayar: new Date().toISOString(),
            })
            .eq("id_transaksi", id_transaksi);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Hapus notifikasi pending
        await (adminSupabase as any)
            .from("notifications")
            .delete()
            .eq("recipient_id", user.id)
            .eq("type", "pembayaran_done");

        return NextResponse.json({ message: "Pembayaran berhasil diproses" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
