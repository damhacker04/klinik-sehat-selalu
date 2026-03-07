import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker"]);

        const { data, error } = await (supabase as any)
            .from("resep")
            .select("*, detail_resep(*, obat(nama_obat)), rekam_medis(pasien(nama), transaksi(status))")
            .in("status", ["pending", "processing"])
            .order("tanggal_resep", { ascending: true });

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
        await requireRole(supabase, user.id, ["apoteker"]);
        const body = await request.json();
        const { id_resep, status } = body;

        if (!id_resep || !["processing", "completed", "rejected"].includes(status)) {
            return NextResponse.json(
                { error: "id_resep dan status (processing/completed/rejected) wajib" },
                { status: 400 }
            );
        }

        const { error } = await (supabase as any)
            .from("resep")
            .update({ status })
            .eq("id_resep", id_resep);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If completed, reduce stock
        if (status === "completed") {
            const { data: details } = await (supabase as any)
                .from("detail_resep")
                .select("id_obat, jumlah")
                .eq("id_resep", id_resep);

            for (const detail of details || []) {
                const { data: obat } = await (supabase as any)
                    .from("obat")
                    .select("stok")
                    .eq("id_obat", detail.id_obat)
                    .single();

                if (obat) {
                    await (supabase as any)
                        .from("obat")
                        .update({ stok: Math.max(0, obat.stok - detail.jumlah) })
                        .eq("id_obat", detail.id_obat);
                }
            }
        }

        // Auto Billing & Notification
        if (status === "completed") {
            const { createAdminClient } = await import("@/lib/supabase/admin");
            const adminSupabase = createAdminClient();

            const { data: resepInfo } = await (adminSupabase as any)
                .from("resep")
                .select("id_rekam, rekam_medis(id_pasien), detail_resep(jumlah, obat(nama_obat, harga))")
                .eq("id_resep", id_resep)
                .single();

            const idPasien = resepInfo?.rekam_medis?.id_pasien;
            if (idPasien && resepInfo.id_rekam) {
                const items = [];
                items.push({
                    keterangan: "Jasa Konsultasi / Pemeriksaan Medis",
                    biaya: 50000
                });

                for (const detail of resepInfo.detail_resep || []) {
                    const obatNama = detail.obat?.nama_obat || "Obat";
                    const obatHarga = detail.obat?.harga || 0;
                    const jumlah = detail.jumlah || 0;
                    items.push({
                        keterangan: `Obat: ${obatNama} (${jumlah}x)`,
                        biaya: obatHarga * jumlah
                    });
                }

                const totalBiaya = items.reduce((sum: number, item: any) => sum + item.biaya, 0);

                // Ambil id_kasir pertama sebagai default untuk draft (karena id_kasir NOT NULL)
                const { data: kasirDefault } = await (adminSupabase as any)
                    .from("kasir")
                    .select("id_kasir")
                    .limit(1)
                    .single();

                const { data: transaksi, error: transError } = await (adminSupabase as any)
                    .from("transaksi")
                    .insert({
                        id_pasien: idPasien,
                        id_rekam: resepInfo.id_rekam,
                        total_biaya: totalBiaya,
                        status: "draft",
                        id_kasir: kasirDefault?.id_kasir || 1
                    })
                    .select()
                    .single();

                if (transError) {
                    console.error("Auto-Billing Transaksi Error:", transError);
                }

                if (transaksi) {
                    const rincianItems = items.map((item: any) => ({
                        id_transaksi: transaksi.id_transaksi,
                        keterangan: item.keterangan,
                        biaya: item.biaya
                    }));
                    await (adminSupabase as any)
                        .from("rincian_transaksi")
                        .insert(rincianItems);
                }

                const { data: pasienData } = await (adminSupabase as any)
                    .from("pasien")
                    .select("user_id")
                    .eq("id_pasien", idPasien)
                    .single();

                if (pasienData?.user_id) {
                    const { error: notifError } = await (adminSupabase as any).from("notifications").insert({
                        recipient_id: pasienData.user_id,
                        title: "Resep & Tagihan Siap",
                        message: "Resep obat Anda telah selesai disiapkan. Silakan menuju kasir untuk melakukan pembayaran tagihan Anda.",
                        type: "pembayaran_done",
                        channel: "push"
                    });

                    if (notifError) {
                        console.error("Auto-Billing Notif Error:", notifError);
                    }
                }
            }
        }

        return NextResponse.json({ message: "Status resep berhasil diubah" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
