import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        const { data, error } = await (supabase as any)
            .from("form_pendaftaran")
            .select("id_form, id_pasien, tanggal_daftar, keluhan, permintaan_khusus, status, pasien(nama)")
            .eq("status", "pending")
            .order("tanggal_daftar", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formatted = (data || []).map((d: any) => ({
            id: d.id_form,
            nama: d.pasien?.nama || "Unknown",
            tanggal: new Date(d.tanggal_daftar).toLocaleDateString("id-ID"),
            keluhan: d.keluhan,
            permintaan_khusus: d.permintaan_khusus,
            status: d.status,
        }));

        return NextResponse.json(formatted);
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
        const { id_form, action } = body;

        if (!id_form || !["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "id_form dan action (approve/reject) wajib" },
                { status: 400 }
            );
        }

        const newStatus = action === "approve" ? "verified" : "rejected";

        const { error: updateError } = await (supabase as any)
            .from("form_pendaftaran")
            .update({ status: newStatus })
            .eq("id_form", id_form);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // If approved, create antrian
        if (action === "approve") {
            // Get the next antrian number
            const { count } = await (supabase as any)
                .from("antrian")
                .select("*", { count: "exact", head: true });

            const nomorAntrian = (count || 0) + 1;

            const { error: antrianError } = await (supabase as any)
                .from("antrian")
                .insert({
                    id_form,
                    nomor_antrian: nomorAntrian,
                    status: "waiting",
                });

            if (antrianError) {
                return NextResponse.json({ error: antrianError.message }, { status: 500 });
            }
        }

        return NextResponse.json({
            message: action === "approve" ? "Pendaftaran diverifikasi" : "Pendaftaran ditolak",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
