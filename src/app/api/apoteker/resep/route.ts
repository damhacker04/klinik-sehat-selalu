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
            .select("*, detail_resep(*, obat(nama_obat)), rekam_medis(pasien(nama))")
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

        if (!id_resep || !["processing", "completed"].includes(status)) {
            return NextResponse.json(
                { error: "id_resep dan status (processing/completed) wajib" },
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

        // Auto-notification: notify pasien when resep completed
        if (status === "completed") {
            const { data: resepInfo } = await (supabase as any)
                .from("resep")
                .select("rekam_medis(id_pasien)")
                .eq("id_resep", id_resep)
                .single();
            const idPasien = resepInfo?.rekam_medis?.id_pasien;
            if (idPasien) {
                await (supabase as any).from("notifications").insert({
                    id_pasien: idPasien,
                    judul: "Resep Siap",
                    pesan: "Resep obat Anda telah selesai disiapkan. Silakan menuju apotek untuk mengambil obat.",
                    dibaca: false,
                });
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
