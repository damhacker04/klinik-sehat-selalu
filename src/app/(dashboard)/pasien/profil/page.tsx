"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pasienSchema, type PasienInput } from "@/lib/validations/patient";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Styling helpers ────────────────────────────────────────────────────────

const GLASS =
  "bg-white dark:bg-white/[0.04] backdrop-blur-xl " +
  "border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-none";

const INPUT =
  "w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 " +
  "bg-slate-100 dark:bg-white/[0.05] " +
  "border border-slate-200 dark:border-white/10 " +
  "text-slate-800 dark:text-white " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const INPUT_ERR =
  "w-full rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200 " +
  "bg-slate-100 dark:bg-white/[0.05] " +
  "border border-red-400 dark:border-red-500/70 " +
  "text-slate-800 dark:text-white " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

const LABEL =
  "block text-sm font-medium text-slate-600 dark:text-slate-300 ml-1 mb-1.5";

// ─── Type ────────────────────────────────────────────────────────────────────

type ProfilData = {
  id_pasien: string | number;
  nama: string;
  nik: string;
  email: string | null;
  no_hp: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  riwayat_kesehatan: string | null;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfilPasienPage() {
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password section
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const form = useForm<PasienInput>({
    resolver: zodResolver(pasienSchema),
    defaultValues: {
      nama: "",
      nik: "",
      tanggal_lahir: "",
      alamat: "",
      no_hp: "",
      email: "",
      riwayat_kesehatan: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  // Fetch profile on mount
  useEffect(() => {
    fetch("/api/pasien/profil")
      .then((r) => r.json())
      .then((data: ProfilData) => {
        setProfil(data);
        reset({
          nama: data.nama || "",
          nik: data.nik === "-" ? "" : data.nik || "",
          tanggal_lahir: data.tanggal_lahir || "",
          alamat: data.alamat || "",
          no_hp: data.no_hp || "",
          email: data.email || "",
          riwayat_kesehatan: data.riwayat_kesehatan || "",
        });
      })
      .catch(() => toast.error("Gagal memuat data profil"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: PasienInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/pasien/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal menyimpan profil");
        return;
      }
      setProfil((p) => (p ? { ...p, ...json } : json));
      reset(data); // Mark form as pristine
      toast.success("Profil berhasil diperbarui!");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPwd) {
      toast.error("Masukkan kata sandi saat ini");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }

    setPwdSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Sesi tidak valid");
        return;
      }

      // Verify current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPwd,
      });
      if (signInErr) {
        toast.error("Kata sandi saat ini tidak sesuai");
        return;
      }

      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPwd,
      });
      if (updateErr) {
        toast.error(updateErr.message);
        return;
      }

      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 4000);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setPwdSaving(false);
    }
  }

  // Avatar initials from name
  const initials = profil?.nama
    ? profil.nama
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "—";

  const rmId = profil?.id_pasien
    ? `ID-${String(profil.id_pasien).padStart(4, "0")}`
    : "—";

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-8">
      {/* ── Avatar Header ── */}
      <header className="relative flex flex-col items-center pt-4 pb-2">
        {/* Avatar with gradient ring */}
        <div className="relative mb-5">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary via-blue-400/60 to-transparent opacity-50 blur-md" />
          <div
            className="
              relative w-28 h-28 rounded-full
              bg-gradient-to-br from-primary/20 to-blue-500/10
              dark:from-primary/30 dark:to-blue-500/20
              border-4 border-white dark:border-slate-900
              flex items-center justify-center
              shadow-xl
            "
          >
            {loading ? (
              <div className="w-full h-full rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-primary dark:text-blue-300 select-none">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Name + ID */}
        {loading ? (
          <div className="space-y-2 text-center">
            <div className="h-7 w-40 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse mx-auto" />
            <div className="h-4 w-28 bg-slate-100 dark:bg-white/5 rounded animate-pulse mx-auto" />
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {profil?.nama || "—"}
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              {rmId}
            </p>
          </div>
        )}
      </header>

      {/* ── Profile Form Card ── */}
      <section className={`${GLASS} rounded-3xl p-6 md:p-10`}>
        {/* Error banner */}
        {hasErrors && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-400/40 text-red-600 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Mohon perbaiki kesalahan di bawah untuk melanjutkan.
            </p>
          </div>
        )}

        {loading ? (
          /* Skeleton loader */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                </div>
              ))}
            </div>
            <div className="h-24 w-full bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Lengkap */}
              <div>
                <label className={LABEL}>
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("nama")}
                  placeholder="Masukkan nama lengkap"
                  className={errors.nama ? INPUT_ERR : INPUT}
                />
                {errors.nama && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.nama.message}
                  </p>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className={LABEL}>
                  NIK (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("nik")}
                  placeholder="Masukkan 16 digit NIK"
                  maxLength={16}
                  className={errors.nik ? INPUT_ERR : INPUT}
                />
                {errors.nik && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.nik.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={LABEL}>Alamat Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="nama@email.com"
                  className={errors.email ? INPUT_ERR : INPUT}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* No. Telepon */}
              <div>
                <label className={LABEL}>No. Telepon</label>
                <input
                  {...register("no_hp")}
                  type="tel"
                  placeholder="0812..."
                  className={errors.no_hp ? INPUT_ERR : INPUT}
                />
                {errors.no_hp && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.no_hp.message}
                  </p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className={LABEL}>Tanggal Lahir</label>
                <input
                  {...register("tanggal_lahir")}
                  type="date"
                  className={`${INPUT} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>

              {/* Riwayat Kesehatan */}
              <div>
                <label className={LABEL}>Riwayat Kesehatan</label>
                <input
                  {...register("riwayat_kesehatan")}
                  placeholder="Alergi, penyakit bawaan, dll."
                  className={INPUT}
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className={LABEL}>Alamat Lengkap</label>
              <textarea
                {...register("alamat")}
                rows={3}
                placeholder="Masukkan alamat lengkap sesuai KTP..."
                className={`${INPUT} resize-none`}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => reset()}
                disabled={saving || !isDirty}
                className="
                  w-full sm:w-auto px-8 py-3 rounded-2xl
                  text-slate-500 dark:text-slate-400
                  hover:text-slate-800 dark:hover:text-white
                  transition-colors duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="
                  w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-semibold
                  px-10 py-3 rounded-2xl
                  shadow-lg shadow-primary/30 hover:shadow-primary/40
                  transition-all duration-200 active:scale-95 hover:-translate-y-0.5
                  flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:translate-y-0 disabled:hover:bg-primary disabled:shadow-none
                "
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── Keamanan & Kata Sandi ── */}
      <section className={`${GLASS} rounded-3xl p-6 md:p-10`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Keamanan &amp; Kata Sandi
          </h2>
        </div>

        {/* Success inline banner */}
        {pwdSuccess && (
          <div
            className="
              mb-6 flex items-center gap-3 p-4 rounded-2xl
              bg-emerald-500/10 border border-emerald-500/30
              text-emerald-700 dark:text-emerald-300
              animate-in fade-in slide-in-from-top-2 duration-300
            "
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Berhasil!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Kata sandi berhasil diperbarui.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          {/* Kata Sandi Saat Ini — full width */}
          <div>
            <label className={LABEL}>Kata Sandi Saat Ini</label>
            <div className="relative">
              <input
                type={showCurr ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                className={`${INPUT} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowCurr((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                {showCurr ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kata Sandi Baru */}
            <div>
              <label className={LABEL}>Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
              <label className={LABEL}>Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showConf ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={pwdSaving}
              className="
                w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-semibold
                px-10 py-3 rounded-2xl
                shadow-lg shadow-primary/30 hover:shadow-primary/40
                transition-all duration-200 active:scale-95 hover:-translate-y-0.5
                flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
                disabled:hover:translate-y-0 disabled:hover:bg-primary disabled:shadow-none
              "
            >
              {pwdSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Perbarui Kata Sandi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
