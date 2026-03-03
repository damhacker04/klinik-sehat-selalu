import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

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
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);
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

        return NextResponse.json({ message: "Status resep berhasil diubah" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
