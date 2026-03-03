import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });
        const body = await request.json();
        const { rating, komentar } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating harus antara 1-5" },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("feedback")
            .insert({
                id_pasien: idPasien,
                rating,
                komentar: komentar || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Feedback berhasil dikirim", data },
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
        const idPasien = await getIdPasien(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        const { data, error } = await (supabase as any)
            .from("feedback")
            .select("*")
            .eq("id_pasien", idPasien)
            .order("tanggal_feedback", { ascending: false });

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
