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
      console.error("Supabase createUser error:", JSON.stringify(error, null, 2));
      // Handle duplicate email
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        return NextResponse.json(
          { error: "Email ini sudah terdaftar. Silakan login." },
          { status: 409 }
        );
      }
      // Handle database trigger errors
      if (error.message.includes("Database error")) {
        return NextResponse.json(
          { error: "Gagal membuat akun. Pastikan tabel database sudah disetup dengan benar (jalankan run-all-migrations.sql di Supabase SQL Editor)." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create pasien record linked to the auth user
    const { error: pasienError } = await supabaseAdmin
      .from("pasien")
      .insert({
        user_id: data.user.id,
        nama,
        nik,
        email,
      });

    if (pasienError) {
      console.error("Failed to create pasien record:", pasienError.message);
      // User was created but pasien record failed - still return success
      // as the user can still log in
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
