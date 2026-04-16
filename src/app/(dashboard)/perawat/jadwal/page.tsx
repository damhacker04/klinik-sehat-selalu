"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Clock, Moon, BedDouble, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JadwalItem {
  id_jadwal: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  dokter: { nama: string } | null;
  perawat: { nama: string } | null;
}

type ShiftType = "morning" | "afternoon" | "night";

// ─── Constants ────────────────────────────────────────────────────────────────

const HARI_ORDER = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const HARI_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns Mon–Sun Date array for week at given offset (0 = this week, 1 = next) */
function getWeekDates(weekOffset = 0): Date[] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function deriveShift(jamMulai: string): ShiftType {
  const h = parseInt(jamMulai.slice(0, 2), 10);
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "night";
}

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter((w) => w.length > 0 && w.toLowerCase() !== "dr." && w.toLowerCase() !== "drg.")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function fmtMonthYear(d: Date): string {
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

// ─── Shift Badge ──────────────────────────────────────────────────────────────

const SHIFT_CONFIG: Record<
  ShiftType,
  { label: string; badge: string; dayBg: string; dayText: string; avatarBorder: string }
> = {
  morning: {
    label: "Morning Shift",
    badge: "bg-primary/15 text-primary dark:bg-primary/20 dark:text-blue-300",
    dayBg: "bg-primary/10 dark:bg-primary/15 border border-primary/20",
    dayText: "text-primary dark:text-blue-300",
    avatarBorder: "border-primary/30",
  },
  afternoon: {
    label: "Afternoon Shift",
    badge: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    dayBg: "bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20",
    dayText: "text-amber-600 dark:text-amber-400",
    avatarBorder: "border-amber-500/30",
  },
  night: {
    label: "Night Shift",
    badge: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    dayBg: "bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20",
    dayText: "text-purple-600 dark:text-purple-400",
    avatarBorder: "border-purple-500/30",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        {[0, 1].map((s) => (
          <div key={s} className="space-y-4">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Jadwal Card ───────────────────────────────────────────────────────

function ActiveCard({
  date,
  item,
}: {
  date: Date;
  item: JadwalItem;
}) {
  const shift = deriveShift(item.jam_mulai);
  const cfg = SHIFT_CONFIG[shift];
  const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;

  return (
    <div
      className={`${GLASS} rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300`}
    >
      {/* Left: day box + info */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* Day box */}
        <div
          className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] md:min-w-[64px] md:h-16 ${cfg.dayBg} rounded-xl shrink-0`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.dayText}`}>
            {HARI_SHORT[dayIdx]}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {date.getDate()}
          </span>
        </div>

        {/* Shift info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`${cfg.badge} text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider`}
            >
              {cfg.label}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {item.jam_mulai.slice(0, 5)} – {item.jam_selesai.slice(0, 5)}
            </span>
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
            {item.hari}
          </h3>
        </div>
      </div>

      {/* Right: doctor info */}
      {item.dokter?.nama && (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-2 shrink-0 self-start sm:self-auto">
          <div
            className={`w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 border-2 ${cfg.avatarBorder} flex items-center justify-center shrink-0`}
          >
            <span className="text-[11px] font-bold text-primary dark:text-blue-300">
              {getInitials(item.dokter.nama)}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Dokter Bertugas
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {item.dokter.nama}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Off Day Card ─────────────────────────────────────────────────────────────

function OffDayCard({ date }: { date: Date }) {
  const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;

  return (
    <div className="opacity-60 border-2 border-dashed border-slate-300 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 flex items-center justify-between group hover:opacity-100 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-5">
        {/* Day box — muted */}
        <div className="flex flex-col items-center justify-center min-w-[60px] h-[60px] md:min-w-[64px] md:h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {HARI_SHORT[dayIdx]}
          </span>
          <span className="text-xl font-black text-slate-400 dark:text-slate-500">
            {date.getDate()}
          </span>
        </div>

        <div>
          <div className="mb-1">
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Off Day
            </span>
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-400 dark:text-slate-500">
            Hari Libur
          </h3>
        </div>
      </div>

      <Moon className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors shrink-0" />
    </div>
  );
}

// ─── Week Section ─────────────────────────────────────────────────────────────

function WeekSection({
  title,
  titleColor,
  dates,
  jadwalMap,
}: {
  title: string;
  titleColor: string;
  dates: Date[];
  jadwalMap: Map<string, JadwalItem>;
}) {
  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2 className={`text-[11px] font-black uppercase tracking-widest shrink-0 ${titleColor}`}>
          {title}
        </h2>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800/60" />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {dates.map((date, i) => {
          const hariName = HARI_ORDER[i];
          const item = jadwalMap.get(hariName);
          return item ? (
            <ActiveCard key={i} date={date} item={item} />
          ) : (
            <OffDayCard key={i} date={date} />
          );
        })}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JadwalPerawatPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/perawat/jadwal")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setJadwal(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const thisWeek = useMemo(() => getWeekDates(0), []);
  const nextWeek = useMemo(() => getWeekDates(1), []);

  // Map hari name → jadwal item (first match)
  const jadwalMap = useMemo(() => {
    const m = new Map<string, JadwalItem>();
    for (const item of jadwal) {
      if (!m.has(item.hari)) m.set(item.hari, item);
    }
    return m;
  }, [jadwal]);

  // Count remaining work days this week (from today onwards)
  const hariKerjatersisa = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return thisWeek.filter((d, i) => {
      if (d < today) return false;
      return jadwalMap.has(HARI_ORDER[i]);
    }).length;
  }, [thisWeek, jadwalMap]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5">
              Jadwal Tugas Saya
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              {fmtMonthYear(new Date())}
              {hariKerjatersisa > 0 && (
                <span className="text-slate-400 dark:text-slate-500">
                  • {hariKerjatersisa} Hari Kerja Tersisa
                </span>
              )}
            </p>
          </div>

          {/* Month label pill */}
          <div
            className={`${GLASS} px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 self-start shrink-0`}
          >
            <Calendar className="w-4 h-4 text-primary" />
            {fmtMonthYear(new Date())}
          </div>
        </header>

        {/* ── This Week ── */}
        <WeekSection
          title="Minggu Ini"
          titleColor="text-primary"
          dates={thisWeek}
          jadwalMap={jadwalMap}
        />

        {/* ── Next Week ── */}
        <WeekSection
          title="Minggu Depan"
          titleColor="text-slate-400 dark:text-slate-500"
          dates={nextWeek}
          jadwalMap={jadwalMap}
        />

        {/* ── Footer: Ajukan Cuti ── */}
        <footer className="rounded-2xl bg-primary/10 dark:bg-primary/10 border border-primary/20 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Ingin mengajukan cuti?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hubungi admin untuk pengajuan cuti minimal 7 hari sebelumnya.
              </p>
            </div>
          </div>
          <button
            disabled
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold opacity-70 cursor-not-allowed shrink-0"
          >
            Ajukan Cuti
          </button>
        </footer>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
          Sistem Informasi Manajemen Klinik © 2024
        </p>

      </div>
    </div>
  );
}
