import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdKasir } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        // Get pasien yang sudah selesai diperiksa (punya resep completed)
        const { data, error } = await (supabase as any)
            .from("transaksi")
            .select("*, pasien(nama), rincian_transaksi(*)")
            .order("id_transaksi", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idKasir = await getIdKasir(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { id_pasien, id_rekam, items, metode_pembayaran } = body;

        if (!id_pasien || !items || items.length === 0) {
            return NextResponse.json(
                { error: "id_pasien dan items wajib" },
                { status: 400 }
            );
        }

        const totalBiaya = items.reduce(
            (sum: number, item: any) => sum + (item.biaya || 0),
            0
        );

        // Create transaksi
        const { data: transaksi, error: transError } = await (supabase as any)
            .from("transaksi")
            .insert({
                id_pasien,
                id_rekam: id_rekam || null,
                total_biaya: totalBiaya,
                metode_pembayaran: metode_pembayaran || null,
                status: metode_pembayaran ? "paid" : "draft",
                tanggal_bayar: metode_pembayaran ? new Date().toISOString() : null,
                id_kasir: idKasir,
            })
            .select()
            .single();

        if (transError) {
            return NextResponse.json({ error: transError.message }, { status: 500 });
        }

        // Create rincian transaksi
        const rincian = items.map((item: any) => ({
            id_transaksi: transaksi.id_transaksi,
            keterangan: item.keterangan,
            biaya: item.biaya,
        }));

        const { error: rincianError } = await (supabase as any)
            .from("rincian_transaksi")
            .insert(rincian);

        if (rincianError) {
            return NextResponse.json({ error: rincianError.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Transaksi berhasil dibuat", data: transaksi },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
