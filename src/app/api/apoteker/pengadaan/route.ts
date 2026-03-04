import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker"]);

        const { data, error } = await (supabase as any)
            .from("purchase_request")
            .select("*, obat(nama_obat)")
            .order("created_at", { ascending: false });

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

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker"]);
        const body = await request.json();
        const { id_obat, jumlah_diminta, catatan } = body;

        if (!id_obat || !jumlah_diminta) {
            return NextResponse.json(
                { error: "id_obat dan jumlah_diminta wajib" },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("purchase_request")
            .insert({
                id_obat,
                jumlah_diminta,
                catatan: catatan || null,
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Purchase request berhasil dibuat", data },
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
        await requireRole(supabase, user.id, ["apoteker"]);
        const body = await request.json();
        const { id_request, status } = body;

        const validTransitions: Record<string, string[]> = {
            pending: ["approved"],
            approved: ["ordered"],
            ordered: ["received"],
        };

        if (!id_request || !status) {
            return NextResponse.json(
                { error: "id_request dan status wajib" },
                { status: 400 }
            );
        }

        // Get current status
        const { data: current } = await (supabase as any)
            .from("purchase_request")
            .select("status, id_obat, jumlah_diminta")
            .eq("id_request", id_request)
            .single();

        if (!current) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        const allowed = validTransitions[current.status];
        if (!allowed || !allowed.includes(status)) {
            return NextResponse.json(
                { error: `Tidak bisa ubah status dari ${current.status} ke ${status}` },
                { status: 400 }
            );
        }

        const { error } = await (supabase as any)
            .from("purchase_request")
            .update({ status })
            .eq("id_request", id_request);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If received, auto-update stock
        if (status === "received") {
            const { data: obat } = await (supabase as any)
                .from("obat")
                .select("stok")
                .eq("id_obat", current.id_obat)
                .single();

            if (obat) {
                await (supabase as any)
                    .from("obat")
                    .update({ stok: obat.stok + current.jumlah_diminta })
                    .eq("id_obat", current.id_obat);
            }
        }

        return NextResponse.json({ message: "Status berhasil diupdate" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
