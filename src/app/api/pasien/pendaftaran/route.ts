import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

async function ensurePasienRecord(supabase: any, userId: string, email: string, nama: string) {
    // Try to get existing pasien
    const { data: existing } = await supabase
        .from("pasien")
        .select("id_pasien")
        .eq("user_id", userId)
        .single();

    if (existing) return existing.id_pasien;

    // Create pasien record if not exists
    const { data: newPasien, error } = await supabase
        .from("pasien")
        .insert({
            user_id: userId,
            nama: nama || email,
            nik: "-",
            email: email,
        })
        .select("id_pasien")
        .single();

    if (error) throw new Error("Gagal membuat data pasien: " + error.message);
    return newPasien.id_pasien;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const body = await request.json();
        const idPasien = await ensurePasienRecord(supabase, user.id, user.email || "", user.user_metadata?.nama || user.email || "");
        const { keluhan, permintaan_khusus } = body;

        if (!keluhan) {
            return NextResponse.json({ error: "Keluhan wajib diisi" }, { status: 400 });
        }

        // Insert form pendaftaran
        const { data: form, error: formError } = await (supabase as any)
            .from("form_pendaftaran")
            .insert({
                id_pasien: idPasien,
                keluhan,
                permintaan_khusus: permintaan_khusus || null,
                status: "pending",
            })
            .select()
            .single();

        if (formError) {
            return NextResponse.json({ error: formError.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Pendaftaran berhasil dikirim", data: form },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await ensurePasienRecord(supabase, user.id, user.email || "", user.user_metadata?.nama || user.email || "");

        const { data, error } = await (supabase as any)
            .from("form_pendaftaran")
            .select("*")
            .eq("id_pasien", idPasien)
            .order("tanggal_daftar", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
