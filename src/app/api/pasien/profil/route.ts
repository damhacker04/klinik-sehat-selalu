import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";
import { pasienSchema } from "@/lib/validations/patient";

// GET: Fetch patient profile
export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, {
            email: user.email,
            nama: user.user_metadata?.nama,
        });

        const { data, error } = await (supabase as any)
            .from("pasien")
            .select("*")
            .eq("id_pasien", idPasien)
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Gagal mengambil data profil" },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

// PUT: Update patient profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, {
            email: user.email,
            nama: user.user_metadata?.nama,
        });

        const body = await request.json();
        const parsed = pasienSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0];
            return NextResponse.json(
                { error: firstError.message },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("pasien")
            .update({
                nama: parsed.data.nama,
                nik: parsed.data.nik,
                tanggal_lahir: parsed.data.tanggal_lahir || null,
                alamat: parsed.data.alamat || null,
                no_hp: parsed.data.no_hp || null,
                email: parsed.data.email || null,
                riwayat_kesehatan: parsed.data.riwayat_kesehatan || null,
            })
            .eq("id_pasien", idPasien)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Gagal memperbarui profil: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
