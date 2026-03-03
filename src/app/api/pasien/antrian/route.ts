import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser, getIdPasien } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        const idPasien = await getIdPasien(supabase, user.id, { email: user.email, nama: user.user_metadata?.nama });

        // Get antrian for this pasien's active form
        const { data: forms } = await (supabase as any)
            .from("form_pendaftaran")
            .select("id_form")
            .eq("id_pasien", idPasien)
            .eq("status", "verified");

        if (!forms || forms.length === 0) {
            return NextResponse.json({ antrian: null, currentServing: null });
        }

        const formIds = forms.map((f: any) => f.id_form);

        // Get my antrian
        const { data: myAntrian } = await (supabase as any)
            .from("antrian")
            .select("*")
            .in("id_form", formIds)
            .in("status", ["waiting", "called"])
            .order("nomor_antrian", { ascending: true })
            .limit(1);

        // Use admin client (bypass RLS) to get the currently serving number
        // because the pasien RLS policy only allows seeing their own queue
        const adminSupabase = createAdminClient();
        const { data: currentServing } = await (adminSupabase as any)
            .from("antrian")
            .select("nomor_antrian")
            .eq("status", "called")
            .order("waktu_panggil", { ascending: false })
            .limit(1);

        return NextResponse.json({
            antrian: myAntrian?.[0] || null,
            currentServing: currentServing?.[0]?.nomor_antrian || null,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
