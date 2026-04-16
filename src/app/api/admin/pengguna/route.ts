import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getAuthUser, requireRole } from "@/lib/supabase/queries";

function getServiceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET() {
    try {
        const supabase = await createClient();
        const user = await getAuthUser(supabase);
        await requireRole(supabase, user.id, ["admin"]);

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
        const { email, password, role } = body;

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: "Email, password, dan role wajib diisi" },
                { status: 400 }
            );
        }

        const validRoles = ["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
        }

        const serviceClient = getServiceClient();
        const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Update the role in user_accounts (trigger creates the row with default 'pasien')
        if (authData.user && role !== "pasien") {
            await serviceClient
                .from("user_accounts" as any)
                .update({ role })
                .eq("id", authData.user.id);
        }

        return NextResponse.json({ message: "Pengguna berhasil dibuat", id: authData.user?.id });
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
        const { userId, role, status } = body;

        if (!userId) {
            return NextResponse.json({ error: "userId wajib" }, { status: 400 });
        }

        if (!role && !status) {
            return NextResponse.json(
                { error: "role atau status wajib diisi" },
                { status: 400 }
            );
        }

        const updates: Record<string, string> = {};

        if (role) {
            const validRoles = ["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
            }
            updates.role = role;
        }

        if (status) {
            const validStatuses = ["active", "inactive", "suspended"];
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
            }
            updates.status = status;
        }

        const { error } = await (supabase as any)
            .from("user_accounts")
            .update(updates)
            .eq("id", userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Pengguna berhasil diperbarui" });
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
        const currentUser = await getAuthUser(supabase);
        await requireRole(supabase, currentUser.id, ["admin"]);
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json(
                { error: "ID pengguna wajib" },
                { status: 400 }
            );
        }

        // Prevent self-deletion
        if (userId === currentUser.id) {
            return NextResponse.json(
                { error: "Tidak dapat menghapus akun sendiri" },
                { status: 400 }
            );
        }

        const serviceClient = getServiceClient();
        const { error: authError } = await serviceClient.auth.admin.deleteUser(userId);

        if (authError) {
            // Fallback: delete from user_accounts directly
            const { error } = await (supabase as any)
                .from("user_accounts")
                .delete()
                .eq("id", userId);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ message: "Pengguna berhasil dihapus" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Server error" },
            { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500 }
        );
    }
}
