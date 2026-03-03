import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

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
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);
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
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
