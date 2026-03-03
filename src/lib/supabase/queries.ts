/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Get the current authenticated user or throw
 */
export async function getAuthUser(supabase: any) {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    return user;
}

/**
 * Get the user account with role from user_accounts table
 */
export async function getUserAccount(supabase: any, userId: string) {
    const { data, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw new Error("User account not found");
    return data;
}

/**
 * Get id_pasien from user_id — auto-creates pasien record if not exists
 */
export async function getIdPasien(
    supabase: any,
    userId: string,
    userMeta?: { email?: string; nama?: string }
) {
    const { data } = await supabase
        .from("pasien")
        .select("id_pasien")
        .eq("user_id", userId)
        .single();

    if (data) return data.id_pasien;

    // Auto-create pasien record if not exists
    const { data: newRecord, error } = await supabase
        .from("pasien")
        .insert({
            user_id: userId,
            nama: userMeta?.nama || userMeta?.email || "Pasien",
            nik: "-",
            email: userMeta?.email || null,
        })
        .select("id_pasien")
        .single();

    if (error) throw new Error("Gagal membuat data pasien: " + error.message);
    return newRecord.id_pasien;
}

/**
 * Get id_dokter from user_id — auto-creates dokter record if not exists
 */
export async function getIdDokter(
    supabase: any,
    userId: string,
    userMeta?: { email?: string; nama?: string }
) {
    const { data } = await supabase
        .from("dokter")
        .select("id_dokter")
        .eq("user_id", userId)
        .single();

    if (data) return data.id_dokter;

    // Auto-create dokter record if not exists
    const { data: newRecord, error } = await supabase
        .from("dokter")
        .insert({
            user_id: userId,
            nama: userMeta?.nama || userMeta?.email || "Dokter",
        })
        .select("id_dokter")
        .single();

    if (error) throw new Error("Gagal membuat data dokter: " + error.message);
    return newRecord.id_dokter;
}

/**
 * Get id_perawat from user_id — auto-creates perawat record if not exists
 */
export async function getIdPerawat(
    supabase: any,
    userId: string,
    userMeta?: { email?: string; nama?: string }
) {
    const { data } = await supabase
        .from("perawat")
        .select("id_perawat")
        .eq("user_id", userId)
        .single();

    if (data) return data.id_perawat;

    // Auto-create perawat record if not exists
    const { data: newRecord, error } = await supabase
        .from("perawat")
        .insert({
            user_id: userId,
            nama: userMeta?.nama || userMeta?.email || "Perawat",
        })
        .select("id_perawat")
        .single();

    if (error) throw new Error("Gagal membuat data perawat: " + error.message);
    return newRecord.id_perawat;
}

/**
 * Get id_kasir from user_id — auto-creates kasir record if not exists
 */
export async function getIdKasir(
    supabase: any,
    userId: string,
    userMeta?: { email?: string; nama?: string }
) {
    const { data } = await supabase
        .from("kasir")
        .select("id_kasir")
        .eq("user_id", userId)
        .single();

    if (data) return data.id_kasir;

    // Auto-create kasir record if not exists
    const { data: newRecord, error } = await supabase
        .from("kasir")
        .insert({
            user_id: userId,
            nama: userMeta?.nama || userMeta?.email || "Kasir",
        })
        .select("id_kasir")
        .single();

    if (error) throw new Error("Gagal membuat data kasir: " + error.message);
    return newRecord.id_kasir;
}

/**
 * Get today's date range for filtering (ISO format, UTC-adjusted for WIB)
 */
export function getTodayRange() {
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibNow = new Date(now.getTime() + wibOffset);
    const startOfDay = new Date(wibNow);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(wibNow);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return {
        start: new Date(startOfDay.getTime() - wibOffset).toISOString(),
        end: new Date(endOfDay.getTime() - wibOffset).toISOString(),
    };
}

/**
 * Format currency to Rupiah
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Helper to create a standard JSON error response
 */
export function errorResponse(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}

/**
 * Helper to create a standard JSON success response
 */
export function successResponse(data: unknown, status: number = 200) {
    return Response.json(data, { status });
}
