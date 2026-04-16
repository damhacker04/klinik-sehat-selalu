"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ClipboardList,
  Clock,
  Pill,
  CalendarCheck,
  Stethoscope,
  Heart,
  Thermometer,
  ArrowRight,
  Calendar,
  Zap,
  FileText,
  UserRound,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DokterStats {
  antrianPasien: number;
  pemeriksaanHariIni: number;
  resepDibuat: number;
  kontrolLanjutan: number;
}

interface AntrianItem {
  id_rekam: number;
  tekanan_darah: string | null;
  suhu: number | null;
  berat_badan: number | null;
  pasien: { nama: string } | null;
  keluhan?: string | null;
}

interface JadwalItem {
  id_jadwal: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  dokter: { nama: string; spesialis?: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10";

const HARI_MAP: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

// Gradient palettes for patient avatar cards
const GRADIENTS = [
  "from-primary/40 to-purple-600/40",
  "from-emerald-500/40 to-blue-600/40",
  "from-amber-500/40 to-rose-500/40",
  "from-teal-500/40 to-primary/40",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSalam(): string {
  const h = new Date().getHours();
  if (h < 11) return "Pagi";
  if (h < 15) return "Siang";
  if (h < 18) return "Sore";
  return "Malam";
}

function fmtTime(): string {
  return (
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

function rmId(id: number): string {
  return `[RM-${String(id).padStart(3, "0")}]`;
}

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter((w) => w.toLowerCase() !== "dr." && w.toLowerCase() !== "drg." && w.length > 0)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function deriveShift(jamMulai: string): string {
  const h = parseInt(jamMulai.slice(0, 2), 10);
  if (h < 12) return "Pagi";
  if (h < 18) return "Siang";
  return "Malam";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const STAT_CFG = [
  {
    key: "pemeriksaanHariIni" as keyof DokterStats,
    label: "Pasien Diperiksa",
    badge: "Selesai",
    icon: ClipboardList,
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    badgeColor: "text-emerald-500",
  },
  {
    key: "antrianPasien" as keyof DokterStats,
    label: "Menunggu Diperiksa",
    badge: "Aktif",
    icon: Clock,
    iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeColor: "text-amber-500",
  },
  {
    key: "resepDibuat" as keyof DokterStats,
    label: "Resep Dibuat",
    badge: "Hari Ini",
    icon: Pill,
    iconBg: "bg-blue-500/15 dark:bg-blue-500/20",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/15",
    badgeColor: "text-blue-500",
  },
  {
    key: "kontrolLanjutan" as keyof DokterStats,
    label: "Kontrol Lanjutan",
    badge: "Hari Ini",
    icon: CalendarCheck,
    iconBg: "bg-purple-500/15 dark:bg-purple-500/20",
    iconColor: "text-purple-500",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/15",
    badgeColor: "text-purple-500",
  },
];

function StatCard({
  cfg,
  value,
  loading,
}: {
  cfg: (typeof STAT_CFG)[0];
  value: number;
  loading: boolean;
}) {
  const Icon = cfg.icon;
  return (
    <div
      className={`${GLASS} rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${cfg.iconBg}`}>
          <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${cfg.badgeColor} ${cfg.badgeBg} px-2.5 py-1 rounded-full`}
        >
          {cfg.badge}
        </span>
      </div>
      <div>
        <p className="text-4xl font-black text-slate-900 dark:text-white">
          {loading ? (
            <span className="inline-block w-10 h-9 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
          {cfg.label}
        </p>
      </div>
    </div>
  );
}

// ─── Patient Card ─────────────────────────────────────────────────────────────

function PatientCard({ item, index }: { item: AntrianItem; index: number }) {
  const router = useRouter();
  const nama = item.pasien?.nama ?? "Pasien";
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const initials = getInitials(nama);

  return (
    <div
      className={`${GLASS} rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300`}
    >
      {/* Avatar */}
      <div
        className={`w-full sm:w-32 md:w-36 h-24 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <span className="text-3xl font-black text-white/70">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-3 w-full min-w-0">
        {/* Name + priority */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {rmId(item.id_rekam)} {nama}
            </h3>
            {item.keluhan && (
              <p className="text-slate-400 dark:text-slate-400 text-sm mt-0.5">
                Keluhan:{" "}
                <span className="text-slate-700 dark:text-slate-200">
                  {item.keluhan}
                </span>
              </p>
            )}
          </div>
          <span
            className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full ${
              index === 0
                ? "bg-primary/10 text-primary"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            {index === 0 ? "Prioritas 1" : "Reguler"}
          </span>
        </div>

        {/* Vitals */}
        <div className="flex flex-wrap gap-4 py-2.5 border-y border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              TD: {item.tekanan_darah ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              S: {item.suhu != null ? `${item.suhu}°C` : "—"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/dokter/pemeriksaan")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
        >
          Periksa Sekarang
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-5 w-80 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl"
          />
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DokterDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DokterStats>({
    antrianPasien: 0,
    pemeriksaanHariIni: 0,
    resepDibuat: 0,
    kontrolLanjutan: 0,
  });
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [dokterNama, setDokterNama] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updatedAt] = useState(() => fmtTime());

  useEffect(() => {
    async function fetchAll() {
      try {
        // Get doctor name from auth
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.nama) {
          setDokterNama(user.user_metadata.nama as string);
        }

        const [statsRes, antrianRes, jadwalRes] = await Promise.all([
          fetch("/api/dokter/stats"),
          fetch("/api/dokter/antrian"),
          fetch("/api/dokter/jadwal"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (antrianRes.ok) {
          const d = await antrianRes.json();
          setAntrian(Array.isArray(d) ? d : []);
        }
        if (jadwalRes.ok) {
          const d = await jadwalRes.json();
          setJadwal(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Find today's jadwal entry
  const todayHari = HARI_MAP[new Date().getDay()];
  const todayJadwal = useMemo(
    () => jadwal.find((j) => j.hari === todayHari) ?? null,
    [jadwal, todayHari]
  );

  if (loading) return <PageSkeleton />;

  const QUICK_ACTIONS = [
    {
      label: "Pemeriksaan Baru",
      icon: Stethoscope,
      href: "/dokter/pemeriksaan",
    },
    { label: "Rekam Medis", icon: FileText, href: "/dokter/rekam-medis" },
    { label: "Buat Resep", icon: Pill, href: "/dokter/resep" },
    { label: "Jadwal Saya", icon: Calendar, href: "/dokter/jadwal" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="space-y-6 md:space-y-8">

        {/* ── Header ── */}
        <header>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Selamat {getSalam()},{" "}
            {dokterNama ? (
              <span>
                dr. {dokterNama.replace(/^dr\.\s*/i, "")}
              </span>
            ) : (
              <span>Dokter</span>
            )}{" "}
            <span className="inline-block animate-bounce">🩺</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-1.5">
            Berikut ringkasan praktik Anda hari ini di{" "}
            <span className="font-semibold text-primary">Klinik Sehat Selalu</span>.
          </p>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {STAT_CFG.map((cfg) => (
            <StatCard
              key={cfg.key}
              cfg={cfg}
              value={stats[cfg.key]}
              loading={false}
            />
          ))}
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Left: Patient Queue */}
          <div className="lg:col-span-3 space-y-4 md:space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Pasien Menunggu Pemeriksaan
              </h2>
              <button
                onClick={() => router.push("/dokter/pemeriksaan")}
                className="text-primary font-semibold text-sm hover:underline"
              >
                Lihat Semua Antrean
              </button>
            </div>

            {antrian.length === 0 ? (
              <div
                className={`${GLASS} rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center`}
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <UserRound className="w-7 h-7 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  Tidak Ada Pasien Menunggu
                </p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Pasien yang telah melewati pemeriksaan awal perawat akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {antrian.map((item, i) => (
                  <PatientCard key={item.id_rekam} item={item} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-2 space-y-4 md:space-y-5">

            {/* Jadwal Hari Ini */}
            <div className={`${GLASS} rounded-2xl p-5 md:p-6 space-y-4`}>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  Jadwal Hari Ini
                </h2>
              </div>

              {todayJadwal ? (
                <div className="space-y-2.5">
                  {[
                    {
                      label: "Shift",
                      value: deriveShift(todayJadwal.jam_mulai),
                      highlight: false,
                    },
                    {
                      label: "Jam Kerja",
                      value: `${todayJadwal.jam_mulai.slice(0, 5)} – ${todayJadwal.jam_selesai.slice(0, 5)}`,
                      highlight: false,
                    },
                    {
                      label: "Spesialis",
                      value: todayJadwal.dokter?.spesialis ?? "Umum",
                      highlight: true,
                    },
                  ].map(({ label, value, highlight }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-white/5"
                    >
                      <span className="text-sm text-slate-400 dark:text-slate-400">
                        {label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          highlight
                            ? "text-primary"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-slate-400">
                    Tidak ada jadwal hari ini
                  </p>
                </div>
              )}
            </div>

            {/* Aksi Cepat */}
            <div className={`${GLASS} rounded-2xl p-5 md:p-6 space-y-4`}>
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  Aksi Cepat
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex items-center gap-3.5 p-3.5 w-full text-left rounded-xl border border-transparent hover:bg-primary/5 dark:hover:bg-white/5 hover:border-primary/20 dark:hover:border-primary/20 group transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-primary/15 dark:bg-primary/20 text-primary group-hover:scale-110 transition-transform duration-200 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <div
              className={`${GLASS} rounded-xl px-4 py-3 text-center`}
            >
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Terakhir diperbarui: {updatedAt}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
