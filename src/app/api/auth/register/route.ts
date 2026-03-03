import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nama, nik } = body;

    if (!email || !password || !nama || !nik) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create user with admin client — auto-confirms email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        nama,
        nik,
        role: "pasien",
      },
    });

    if (error) {
      // Handle duplicate email
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        return NextResponse.json(
          { error: "Email ini sudah terdaftar. Silakan login." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Pendaftaran berhasil", userId: data.user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
