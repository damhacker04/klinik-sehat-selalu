"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  Timer,
  Activity,
  ClipboardList,
  History,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerawatStats {
  antrianWaiting: number;
  sudahDiperiksa: number;
  totalPasien: number;
}

interface AntrianItem {
  id_antrian: number;
  nomor_antrian: number;
  status: string;
  created_at: string;
  form_pendaftaran?: {
    keluhan?: string | null;
    pasien?: { nama: string } | null;
  } | null;
}

interface JadwalItem {
  id_jadwal: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  dokter?: { nama: string } | null;
  perawat?: { nama: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(25,30,51,0.7)] backdrop-blur-md border border-slate-200 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function getShiftType(jamMulai: string): string {
  const hour = parseInt(jamMulai.split(":")[0], 10);
  if (hour < 12) return "Shift Pagi";
  if (hour < 18) return "Shift Siang";
  return "Shift Malam";
}

function waitingMinutes(created_at: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(created_at).getTime()) / 60_000)
  );
}

function getTodayJadwal(jadwal: JadwalItem[]): JadwalItem | null {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = days[new Date().getDay()];
  return jadwal.find((j) => j.hari === today) ?? null;
}

function getInitial(nama: string): string {
  return nama.trim()[0]?.toUpperCase() ?? "P";
}

function clampPct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerawatDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PerawatStats>({
    antrianWaiting: 0,
    sudahDiperiksa: 0,
    totalPasien: 0,
  });
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [perawatNama, setPerawatNama] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, antrianRes, jadwalRes] = await Promise.all([
        fetch("/api/perawat/stats"),
        fetch("/api/perawat/antrian"),
        fetch("/api/perawat/jadwal"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (antrianRes.ok) {
        const d = await antrianRes.json();
        setAntrian(Array.isArray(d) ? d : []);
      }
      if (jadwalRes.ok) {
        const d = await jadwalRes.json();
        const arr: JadwalItem[] = Array.isArray(d) ? d : [];
        setJadwal(arr);
        // Try to extract perawat name from jadwal data
        const namaFromJadwal = arr[0]?.perawat?.nama ?? "";
        if (namaFromJadwal) setPerawatNama(namaFromJadwal);
      }
    } catch (err) {
      console.error("[Perawat Dashboard] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Derived values
  const calledCount = antrian.filter((a) => a.status === "called").length;
  const total = Math.max(stats.totalPasien, 1);
  const todayShift = getTodayJadwal(jadwal);

  const displayName = perawatNama
    ? `Ns. ${perawatNama.split(" ")[0]}`
    : "Perawat";

  const calledPct = clampPct(calledCount, total);
  const diperiksPct = clampPct(stats.sudahDiperiksa, total);
  const sisaPct = clampPct(stats.antrianWaiting, total);

  const statCards = [
    {
      label: "Pasien Dipanggil",
      value: loading ? "—" : calledCount,
      icon: Stethoscope,
      color: "text-emerald-500",
      barBg: "bg-emerald-500/20",
      bar: "bg-emerald-500",
      pct: calledPct,
    },
    {
      label: "Sudah Diperiksa",
      value: loading ? "—" : stats.sudahDiperiksa,
      icon: CheckCircle2,
      color: "text-primary",
      barBg: "bg-primary/20",
      bar: "bg-primary",
      pct: diperiksPct,
    },
    {
      label: "Sisa Antrian",
      value: loading ? "—" : stats.antrianWaiting,
      icon: Clock,
      color: "text-amber-500",
      barBg: "bg-amber-500/20",
      bar: "bg-amber-500",
      pct: sisaPct,
    },
  ];

  const quickActions = [
    { label: "Pemeriksaan Awal", icon: ClipboardList, href: "/perawat/pemeriksaan" },
    { label: "Riwayat Pasien", icon: History, href: "/perawat/riwayat" },
    { label: "Jadwal Saya", icon: CalendarDays, href: "/perawat/jadwal" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-8 min-h-full">
      <div className="max-w-[1100px] mx-auto space-y-8">

        {/* ── Header ── */}
        <header>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            {getGreeting()}, {displayName}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base lg:text-lg">
            Semoga shift Anda hari ini berjalan lancar.
          </p>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {statCards.map(({ label, value, icon: Icon, color, barBg, bar, pct }) => (
            <div
              key={label}
              className={`${GLASS} p-6 rounded-xl relative overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default`}
            >
              <div className={`absolute top-4 right-4 ${color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-1 pr-10">
                {label}
              </p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              <div className={`mt-4 h-1 w-full ${barBg} rounded-full overflow-hidden`}>
                <div
                  className={`h-full ${bar} rounded-full transition-all duration-700`}
                  style={{ width: `${loading ? 0 : pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Left column: Patient list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider uppercase">
                Pasien Perlu Diperiksa
              </h2>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                {loading ? "…" : antrian.length} PRIORITAS
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`${GLASS} rounded-xl p-5 h-[76px] animate-pulse`}
                  />
                ))}
              </div>
            ) : antrian.length === 0 ? (
              <div
                className={`${GLASS} rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center`}
              >
                <Activity className="w-10 h-10 text-slate-400" />
                <p className="font-semibold text-slate-500 dark:text-slate-400">
                  Tidak ada pasien menunggu saat ini
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {antrian.map((item, idx) => {
                  const nama = item.form_pendaftaran?.pasien?.nama ?? "Pasien";
                  const initial = getInitial(nama);
                  const menit = waitingMinutes(item.created_at);
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={item.id_antrian}
                      className={`
                        ${GLASS} rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3
                        border-l-4 ${isFirst ? "border-l-primary" : "border-l-primary/30"}
                        hover:bg-primary/5 dark:hover:bg-primary/5
                        transition-all duration-200
                      `}
                    >
                      {/* Patient info */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base sm:text-lg shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                            A{String(item.nomor_antrian).padStart(3, "0")}{" "}
                            {nama}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm truncate">
                            Antrian Reguler •{" "}
                            <span className="text-primary/80">
                              {menit < 1
                                ? "Baru saja"
                                : `Menunggu ${menit}m`}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => router.push("/perawat/pemeriksaan")}
                        className={`
                          flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5
                          rounded-lg font-semibold text-xs sm:text-sm
                          transition-all active:scale-95 shrink-0
                          ${
                            isFirst
                              ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                              : "bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300"
                          }
                        `}
                      >
                        <span className="hidden sm:inline">Periksa Sekarang</span>
                        <span className="sm:hidden">Periksa</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column: Shift + Quick Actions */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">

            {/* Shift Hari Ini */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-4 px-1">
                Shift Hari Ini
              </h2>
              <div className={`${GLASS} rounded-xl p-6 relative overflow-hidden`}>
                {/* Decorative circle */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        todayShift && !loading
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500"
                      }`}
                    >
                      {loading ? "…" : todayShift ? "AKTIF" : "TIDAK ADA"}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {!loading && todayShift
                        ? getShiftType(todayShift.jam_mulai)
                        : "—"}
                    </span>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    </div>
                  ) : todayShift ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Timer className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Jam Kerja
                          </p>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {todayShift.jam_mulai} - {todayShift.jam_selesai}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Stethoscope className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Dokter Pendamping
                          </p>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {todayShift.dokter?.nama
                              ? `Dr. ${todayShift.dokter.nama}`
                              : "—"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Poli Umum
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Tidak ada jadwal untuk hari ini.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Aksi Cepat */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider uppercase mb-4 px-1">
                Aksi Cepat
              </h2>
              <div className="space-y-3">
                {quickActions.map(({ label, icon: Icon, href }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={`
                      ${GLASS} w-full flex items-center gap-4 p-4 rounded-xl text-left
                      hover:bg-primary hover:border-primary
                      group transition-all duration-300
                      active:scale-[0.98]
                    `}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
