import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        const { data, error } = await (supabase as any)
            .from("rekam_medis")
            .select("*")
            .eq("id_pasien", idPasien)
            .order("tanggal_periksa", { ascending: false });

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
