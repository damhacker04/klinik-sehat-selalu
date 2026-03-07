import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);

        // Get all antrian with pasien info
        const { data, error } = await (supabase as any)
            .from("antrian")
            .select("*, form_pendaftaran(id_pasien, keluhan, pasien(nama))")
            .order("nomor_antrian", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Count by status
        const counts = {
            waiting: 0,
            called: 0,
            done: 0,
        };
        (data || []).forEach((a: any) => {
            if (counts[a.status as keyof typeof counts] !== undefined) {
                counts[a.status as keyof typeof counts]++;
            }
        });

        return NextResponse.json({ antrian: data || [], counts });
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
        await requireRole(supabase, user.id, ["admin"]);
        const body = await request.json();
        const { id_antrian, action } = body;

        if (!id_antrian || !["call", "done"].includes(action)) {
            return NextResponse.json(
                { error: "id_antrian dan action (call/done) wajib" },
                { status: 400 }
            );
        }

        const updateData: any = {
            status: action === "call" ? "called" : "done",
        };
        if (action === "call") {
            updateData.waktu_panggil = new Date().toISOString();
        }

        const { error } = await (supabase as any)
            .from("antrian")
            .update(updateData)
            .eq("id_antrian", id_antrian);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Auto-notification: notify pasien when called
        if (action === "call") {
            const { data: antrianInfo } = await (supabase as any)
                .from("antrian")
                .select("form_pendaftaran(id_pasien)")
                .eq("id_antrian", id_antrian)
                .single();
            const idPasien = antrianInfo?.form_pendaftaran?.id_pasien;
            if (idPasien) {
                const { data: pasienData } = await (supabase as any)
                    .from("pasien")
                    .select("user_id")
                    .eq("id_pasien", idPasien)
                    .single();

                if (pasienData?.user_id) {
                    const { createAdminClient } = await import("@/lib/supabase/admin");
                    const adminSupabase = createAdminClient();
                    await (adminSupabase as any).from("notifications").insert({
                        recipient_id: pasienData.user_id,
                        title: "Antrian Dipanggil",
                        message: "Nomor antrian Anda telah dipanggil. Silakan menuju ruang pemeriksaan.",
                        type: "antrian",
                        channel: "push"
                    });
                }
            }
        }

        return NextResponse.json({
            message: action === "call" ? "Pasien dipanggil" : "Antrian selesai",
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
