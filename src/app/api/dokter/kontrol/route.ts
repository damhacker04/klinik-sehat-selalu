import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["dokter"]);

        const { data, error } = await (supabase as any)
            .from("reminder")
            .select("*, rekam_medis(pasien(nama), diagnosa)")
            .order("tanggal_kontrol", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
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
        await requireRole(supabase, user.id, ["dokter"]);
        const body = await request.json();
        const { id_reminder, status } = body;

        const validStatuses = ["sent", "completed"];
        if (!id_reminder || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "id_reminder dan status (sent/completed) wajib" },
                { status: 400 }
            );
        }

        // Get current reminder info
        const { data: current } = await (supabase as any)
            .from("reminder")
            .select("status, id_pasien, tanggal_kontrol")
            .eq("id_reminder", id_reminder)
            .single();

        if (!current) {
            return NextResponse.json({ error: "Reminder tidak ditemukan" }, { status: 404 });
        }

        const { error } = await (supabase as any)
            .from("reminder")
            .update({ status })
            .eq("id_reminder", id_reminder);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Auto-notification: notify pasien about kontrol reminder
        if (status === "sent" && current.id_pasien) {
            const tanggal = new Date(current.tanggal_kontrol).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            await (supabase as any).from("notifications").insert({
                id_pasien: current.id_pasien,
                judul: "Pengingat Kontrol",
                pesan: `Anda dijadwalkan untuk kontrol lanjutan pada ${tanggal}. Jangan lupa untuk mendaftar kembali.`,
                dibaca: false,
            });
        }

        return NextResponse.json({ message: `Status reminder berhasil diubah ke ${status}` });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
