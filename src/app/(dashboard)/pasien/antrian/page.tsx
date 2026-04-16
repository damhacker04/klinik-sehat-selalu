"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Users,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AntrianData = {
  id_antrian: number;
  nomor_antrian: number;
  status: "waiting" | "called" | "done";
  waktu_panggil: string | null;
};

type FormData = {
  id_form: number;
  status: "pending" | "verified" | "rejected";
  tanggal_daftar: string;
};

type PageState =
  | "loading"
  | "active-waiting"
  | "active-called"
  | "done"
  | "pending-verif"
  | "rejected"
  | "empty";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtNum = (n: number) => `A${String(n).padStart(3, "0")}`;

function deriveState(
  antrian: AntrianData | null,
  latestForm: FormData | null
): Exclude<PageState, "loading"> {
  if (antrian) {
    if (antrian.status === "called") return "active-called";
    if (antrian.status === "done") return "done";
    return "active-waiting";
  }
  if (latestForm?.status === "pending") return "pending-verif";
  if (latestForm?.status === "rejected") return "rejected";
  return "empty";
}

// ─── Status badge config ─────────────────────────────────────────────────────

const BADGE: Record<
  Exclude<PageState, "loading" | "empty">,
  { dot: string; label: string }
> = {
  "active-called": { dot: "bg-green-500", label: "DIPANGGIL" },
  "active-waiting": { dot: "bg-amber-400", label: "MENUNGGU" },
  done: { dot: "bg-slate-400", label: "SELESAI" },
  "pending-verif": { dot: "bg-blue-400", label: "MENUNGGU VERIFIKASI" },
  rejected: { dot: "bg-red-500", label: "DITOLAK" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AntrianPage() {
  const [antrian, setAntrian] = useState<AntrianData | null>(null);
  const [currentServing, setCurrentServing] = useState<number | null>(null);
  const [latestForm, setLatestForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [antrianRes, formRes] = await Promise.all([
        fetch("/api/pasien/antrian"),
        fetch("/api/pasien/pendaftaran"),
      ]);
      if (antrianRes.ok) {
        const d = await antrianRes.json();
        setAntrian(d.antrian ?? null);
        setCurrentServing(d.currentServing ?? null);
      }
      if (formRes.ok) {
        const forms: FormData[] = await formRes.json();
        setLatestForm(Array.isArray(forms) ? (forms[0] ?? null) : null);
      }
    } catch (err) {
      console.error("Failed to fetch antrian:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const pageState: PageState = loading
    ? "loading"
    : deriveState(antrian, latestForm);

  const isActive =
    pageState === "active-waiting" || pageState === "active-called";

  const sisaAntrian =
    antrian && pageState === "active-waiting"
      ? Math.max(0, antrian.nomor_antrian - (currentServing ?? 0))
      : 0;

  const badge =
    pageState !== "loading" && pageState !== "empty"
      ? BADGE[pageState]
      : null;

  return (
    <>
      {/* Keyframe for ping-large animation */}
      <style>{`
        @keyframes ping-large {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        .anim-ping-1 { animation: ping-large 2s cubic-bezier(0,0,0.2,1) infinite; }
        .anim-ping-2 { animation: ping-large 2s cubic-bezier(0,0,0.2,1) infinite 1s; }
      `}</style>

      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-50 dark:bg-[#101322]">

        {/* ── Background blobs ── */}
        <div className="pointer-events-none absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[80px] -z-10" />
        <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[80px] -z-10" />

        {/* ── Dot grid ── */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 opacity-[0.025] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#1337ec 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <main className="max-w-4xl mx-auto w-full px-4 py-10 md:py-14 flex flex-col flex-1 justify-center gap-10">

          {/* ── Header ── */}
          <header className="text-center relative">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/30">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                Klinik Sehat Selalu
              </span>
            </div>

            {/* Title */}
            <h1
              className="
                text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight
                bg-gradient-to-b from-slate-800 to-slate-400
                dark:from-white dark:to-slate-400
                bg-clip-text text-transparent
              "
            >
              Status Antrian Live
            </h1>

            {/* Live dot */}
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2 text-sm">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              Pembaruan otomatis setiap 30 detik
            </p>

            {/* Sound toggle */}
            <div className="absolute top-0 right-0 group">
              <button
                onClick={() => setSoundOn((s) => !s)}
                aria-label={soundOn ? "Matikan suara" : "Aktifkan suara"}
                className="
                  h-12 w-12 rounded-full
                  bg-primary/5 dark:bg-white/[0.06]
                  border border-primary/30 dark:border-white/10
                  backdrop-blur-xl
                  flex items-center justify-center text-primary
                  hover:bg-primary/20 dark:hover:bg-white/10
                  transition-all duration-300
                  shadow-[0_0_15px_rgba(19,55,236,0.15)]
                "
              >
                {soundOn ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none border border-slate-700 shadow-lg z-10">
                {soundOn ? "Matikan Suara" : "Aktifkan Suara"}
              </span>
            </div>
          </header>

          {/* ── Main Content ── */}
          {loading ? (
            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-200 dark:bg-white/5 animate-pulse h-64" />
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse h-28" />
                <div className="rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse h-28" />
              </div>
            </div>

          ) : pageState === "empty" ? (
            /* ── Empty state ── */
            <div
              className="
                rounded-[2.5rem] p-12 md:p-20 text-center
                bg-white/80 dark:bg-slate-950/60
                backdrop-blur-xl
                border border-slate-200 dark:border-white/5
                shadow-xl dark:shadow-none
              "
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Belum Ada Antrian Aktif
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                Anda tidak sedang dalam antrian. Daftar kunjungan terlebih dahulu untuk mendapat nomor antrian.
              </p>
              <Link
                href="/pasien/pendaftaran"
                className="
                  inline-flex items-center gap-2
                  bg-primary hover:bg-blue-700 text-white font-semibold
                  px-8 py-3 rounded-2xl
                  shadow-lg shadow-primary/30 hover:shadow-primary/40
                  transition-all duration-200 hover:-translate-y-0.5 active:scale-95
                "
              >
                Daftar Kunjungan
              </Link>
            </div>

          ) : (
            <div className="space-y-6">

              {/* ── Status badge ── */}
              {badge && (
                <div className="flex justify-center">
                  <div
                    className="
                      bg-white/70 dark:bg-slate-950/60
                      backdrop-blur-xl
                      border border-primary/30 dark:border-white/10
                      shadow-[0_0_20px_rgba(19,55,236,0.15)]
                      flex items-center gap-2.5 px-6 py-2.5 rounded-full
                    "
                  >
                    <span className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${badge.dot} animate-pulse`} />
                    <span className="text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-white">
                      {badge.label}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Main card ── */}
              <div
                className="
                  rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden
                  bg-white/80 dark:bg-slate-950/60
                  backdrop-blur-xl
                  border border-slate-200 dark:border-white/5
                  shadow-xl dark:shadow-none
                "
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-6">
                    Nomor Antrian Anda
                  </p>

                  {/* Active queue — giant number */}
                  {isActive && antrian && (
                    <div className="relative inline-block">
                      <div className="absolute inset-0 rounded-full bg-primary/20 anim-ping-1" />
                      <div className="absolute inset-0 rounded-full bg-primary/10 anim-ping-2" />
                      <h2
                        className="
                          text-[7rem] md:text-[11rem] font-black leading-none tracking-tighter relative z-10
                          text-slate-800 dark:text-white
                          drop-shadow-[0_0_30px_rgba(19,55,236,0.2)]
                          dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]
                        "
                      >
                        {fmtNum(antrian.nomor_antrian)}
                      </h2>
                    </div>
                  )}

                  {/* Pending verification */}
                  {pageState === "pending-verif" && (
                    <div className="py-6 space-y-4">
                      <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mx-auto">
                        <Clock className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-slate-700 dark:text-white">
                        Pendaftaran Sedang Diverifikasi
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Admin klinik sedang memproses pendaftaran Anda. Nomor antrian akan diberikan setelah diverifikasi.
                      </p>
                    </div>
                  )}

                  {/* Rejected */}
                  {pageState === "rejected" && (
                    <div className="py-6 space-y-4">
                      <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                      </div>
                      <p className="text-xl font-bold text-slate-700 dark:text-white">
                        Pendaftaran Ditolak
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Silakan hubungi petugas klinik atau daftar ulang untuk informasi lebih lanjut.
                      </p>
                      <Link
                        href="/pasien/pendaftaran"
                        className="
                          inline-flex items-center gap-2
                          bg-primary hover:bg-blue-700 text-white font-semibold
                          px-8 py-3 rounded-2xl mt-2
                          shadow-lg shadow-primary/30 hover:shadow-primary/40
                          transition-all duration-200 hover:-translate-y-0.5 active:scale-95
                        "
                      >
                        Daftar Ulang
                      </Link>
                    </div>
                  )}

                  {/* Done */}
                  {pageState === "done" && (
                    <div className="py-6 space-y-4">
                      <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-slate-700 dark:text-white">
                        Antrian Selesai
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Terima kasih telah berkunjung ke Klinik Sehat Selalu.
                      </p>
                      <Link
                        href="/pasien"
                        className="
                          inline-flex items-center gap-2
                          text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                          font-semibold text-sm
                          transition-colors duration-200
                        "
                      >
                        Kembali ke Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Info cards (active queue only) ── */}
              {isActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current serving */}
                  <div
                    className="
                      rounded-2xl p-6 md:p-8 flex items-center gap-5
                      bg-white/80 dark:bg-primary/[0.05]
                      backdrop-blur-xl
                      border-l-4 border-l-primary/50
                      border border-slate-200 dark:border-white/10
                      shadow-lg dark:shadow-none
                      group hover:border-primary/50 hover:shadow-primary/10
                      transition-all duration-300
                    "
                  >
                    <div className="h-14 w-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                        Pasien Dilayani Saat Ini
                      </p>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {currentServing ? fmtNum(currentServing) : "—"}
                      </h3>
                    </div>
                  </div>

                  {/* Sisa antrian */}
                  <div
                    className="
                      rounded-2xl p-6 md:p-8 flex items-center gap-5
                      bg-white/80 dark:bg-primary/[0.05]
                      backdrop-blur-xl
                      border-l-4 border-l-primary/50
                      border border-slate-200 dark:border-white/10
                      shadow-lg dark:shadow-none
                      group hover:border-primary/50 hover:shadow-primary/10
                      transition-all duration-300
                    "
                  >
                    <div className="h-14 w-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                        Sisa Antrian Sebelum Anda
                      </p>
                      <h3 className="text-3xl font-bold tracking-tight">
                        {pageState === "active-called" ? (
                          <span className="text-green-500 dark:text-green-400">
                            Giliran Anda!
                          </span>
                        ) : (
                          <span className="text-slate-800 dark:text-white">
                            {sisaAntrian}
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          {!loading && (
            <footer className="text-center text-slate-400 dark:text-slate-500 text-sm">
              <div className="inline-flex items-center gap-4 bg-slate-100 dark:bg-slate-900/40 px-6 py-3 rounded-2xl border border-slate-200/80 dark:border-transparent">
                <div className="flex items-center gap-2 border-r border-slate-300 dark:border-slate-700 pr-4">
                  <MapPin className="w-4 h-4" />
                  <span>Lantai 2, Poli Umum</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Bantuan: (021) 555-0123</span>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>
    </>
  );
}
