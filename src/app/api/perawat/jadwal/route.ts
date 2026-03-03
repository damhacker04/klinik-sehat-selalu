import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getIdPerawat } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPerawat = await getIdPerawat(supabase, user.id, {
            email: user.email,
            nama: user.user_metadata?.nama,
        });

        const { data, error } = await (supabase as any)
            .from("jadwal")
            .select("*, dokter(nama), perawat(nama)")
            .eq("id_perawat", idPerawat)
            .order("hari", { ascending: true });

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
