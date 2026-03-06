import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["apoteker", "dokter"]);

        const { data, error } = await (supabase as any)
            .from("obat")
            .select("*")
            .order("nama_obat", { ascending: true });

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
        const { nama_obat, stok, harga, satuan, stok_minimum } = body;

        if (!nama_obat || stok === undefined || !harga) {
            return NextResponse.json(
                { error: "Nama obat, stok, dan harga wajib" },
                { status: 400 }
            );
        }

        const { data, error } = await (supabase as any)
            .from("obat")
            .insert({
                nama_obat,
                stok,
                harga,
                satuan: satuan || null,
                stok_minimum: stok_minimum || 10,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { message: "Obat berhasil ditambahkan", data },
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
        const { id_obat, ...updates } = body;

        if (!id_obat) {
            return NextResponse.json({ error: "id_obat wajib" }, { status: 400 });
        }

        const { error } = await (supabase as any)
            .from("obat")
            .update(updates)
            .eq("id_obat", id_obat);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Obat berhasil diupdate" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
