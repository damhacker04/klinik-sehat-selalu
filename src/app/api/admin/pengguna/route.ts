import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/queries";

export async function GET() {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);

        const { data, error } = await (supabase as any)
            .from("user_accounts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const formatted = (data || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.role,
            status: u.status,
            created_at: new Date(u.created_at).toLocaleDateString("id-ID"),
        }));

        return NextResponse.json(formatted);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        await getAuthUser(supabase);
        const body = await request.json();
        const { userId, role } = body;

        if (!userId || !role) {
            return NextResponse.json(
                { error: "userId dan role wajib" },
                { status: 400 }
            );
        }

        const validRoles = ["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
        }

        const { error } = await (supabase as any)
            .from("user_accounts")
            .update({ role })
            .eq("id", userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Role berhasil diubah" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
