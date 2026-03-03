import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        // Fetch antrian with join attempt
        const { data: antrianData, error } = await (supabase as any)
            .from("antrian")
            .select("*, form_pendaftaran(id_pasien, keluhan, pasien(nama))")
            .in("status", ["waiting", "called"])
            .order("nomor_antrian", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If form_pendaftaran join returned null, fetch separately
        const enriched = await Promise.all(
            (antrianData || []).map(async (item: any) => {
                if (item.form_pendaftaran) return item;

                // Try to fetch form_pendaftaran manually
                const { data: formData } = await (supabase as any)
                    .from("form_pendaftaran")
                    .select("id_pasien, keluhan, pasien(nama)")
                    .eq("id_form", item.id_form)
                    .single();

                return { ...item, form_pendaftaran: formData || null };
            })
        );

        return NextResponse.json(enriched);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
