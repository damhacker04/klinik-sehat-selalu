import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);

        const { data, error } = await (supabase as any)
            .from("jadwal")
            .select("*, dokter(nama), perawat(nama)")
            .order("hari", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formatted = (data || []).map((j: any) => ({
            id: j.id_jadwal,
            nama: j.dokter?.nama || j.perawat?.nama || "-",
            role: j.id_dokter ? "dokter" : "perawat",
            hari: j.hari,
            jam_mulai: j.jam_mulai,
            jam_selesai: j.jam_selesai,
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);
        const body = await request.json();
        const { id_dokter, id_perawat, hari, jam_mulai, jam_selesai } = body;

        if (!hari || !jam_mulai || !jam_selesai) {
            return NextResponse.json(
                { error: "Hari, jam mulai, dan jam selesai wajib" },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("jadwal")
            .insert({
                id_dokter: id_dokter || null,
                id_perawat: id_perawat || null,
                hari,
                jam_mulai,
                jam_selesai,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Jadwal berhasil ditambahkan", data },
            { status: 201 }
        );
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
        const { id, hari, jam_mulai, jam_selesai } = body;

        if (!id) {
            return NextResponse.json({ error: "ID jadwal wajib" }, { status: 400 });
        }

        const updates: Record<string, string> = {};
        if (hari !== undefined) updates.hari = hari;
        if (jam_mulai !== undefined) updates.jam_mulai = jam_mulai;
        if (jam_selesai !== undefined) updates.jam_selesai = jam_selesai;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
        }

        const { error } = await (supabase as any)
            .from("jadwal")
            .update(updates)
            .eq("id_jadwal", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Jadwal berhasil diperbarui" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID jadwal wajib" }, { status: 400 });
        }

        const { error } = await (supabase as any)
            .from("jadwal")
            .delete()
            .eq("id_jadwal", parseInt(id));

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Jadwal berhasil dihapus" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
