"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, Stethoscope, Users, CalendarX, ChevronDown, Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JadwalItem {
  id_jadwal: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  dokter?: { nama: string } | null;
  perawat?: { nama: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const HARI_SHORT: Record<string, string> = {
  Senin: "Sen", Selasa: "Sel", Rabu: "Rab",
  Kamis: "Kam", Jumat: "Jum", Sabtu: "Sab", Minggu: "Min",
};

const MONTHS_ID = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the Monday of the week containing `date` */
function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Returns the date for a given hari index within a week starting at monday */
function getDateForIndex(monday: Date, idx: number): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + idx);
  return d;
}

/** Format "HH:MM:SS" → "HH:MM" */
function fmtTime(t: string): string {
  return t?.substring(0, 5) ?? "—";
}

function getShift(jam_mulai: string) {
  const h = parseInt(jam_mulai?.split(":")[0] ?? "8", 10);
  if (h < 12) return { label: "Shift Pagi", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" };
  if (h < 17) return { label: "Shift Siang", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" };
  return { label: "Shift Malam", bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" };
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDateRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mD = monday.getDate();
  const sD = sunday.getDate();
  const mM = MONTHS_ID[monday.getMonth()].substring(0, 3);
  const sM = MONTHS_ID[sunday.getMonth()].substring(0, 3);
  const y = sunday.getFullYear().toString().substring(2);
  if (monday.getMonth() === sunday.getMonth()) {
    return `${mD} - ${sD} ${mM} 20${y}`;
  }
  return `${mD} ${mM} - ${sD} ${sM} 20${y}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ScheduleCardSkeleton() {
  return (
    <div className="animate-pulse bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 min-h-[220px]">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-3 w-14 bg-slate-200 dark:bg-white/10 rounded-full" />
          <div className="h-7 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
        </div>
        <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
      <div className="space-y-3 mt-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
      <div className="flex justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full" />
          <div className="space-y-1">
            <div className="h-2 w-12 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
          </div>
        </div>
        <div className="h-8 w-14 bg-slate-200 dark:bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Schedule Card ────────────────────────────────────────────────────────────

function ScheduleCard({
  hari,
  date,
  jadwal,
  isToday,
}: {
  hari: string;
  date: Date;
  jadwal: JadwalItem | null;
  isToday: boolean;
}) {
  const day = date.getDate();
  const month = MONTHS_ID[date.getMonth()].substring(0, 3);

  if (!jadwal) {
    // Off/holiday card
    return (
      <div className="relative bg-white/40 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col min-h-[220px] opacity-50">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{hari}</p>
            <h3 className="text-2xl font-bold text-slate-500 dark:text-slate-400">
              {day} {month}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-600/20 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600/30">
            Libur
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 mt-4">
          <CalendarX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-400 text-sm">Hari Libur</p>
        </div>
      </div>
    );
  }

  const shift = getShift(jadwal.jam_mulai);
  const nurseName = jadwal.perawat?.nama || "";
  const nurseInitials = nurseName ? getInitials(nurseName) : "?";

  return (
    <div
      className={`relative bg-white/80 dark:bg-white/[0.05] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group ${
        isToday
          ? "border-l-4 border-l-blue-600 bg-blue-50/50 dark:bg-blue-500/5 dark:border-white/10"
          : "hover:bg-white/90 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/20"
      }`}
    >
      {/* Day / Date */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 ${isToday ? "text-blue-500" : "text-slate-500 dark:text-slate-400"}`}>
            {hari}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {day} {month}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${shift.bg} ${shift.text} ${shift.border}`}
        >
          {shift.label}
        </span>
      </div>

      {/* Time & Poli */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-sm font-medium">
            {fmtTime(jadwal.jam_mulai)} - {fmtTime(jadwal.jam_selesai)} WIB
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Stethoscope className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-sm font-medium">Poliklinik Umum</span>
        </div>
      </div>

      {/* Nurse + Patient count */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          {/* Nurse initials avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 border border-white/10">
            {nurseInitials || "—"}
          </div>
          <div className="leading-none">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
              Perawat
            </p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {nurseName ? `Ns. ${nurseName.split(" ")[0]}` : "—"}
            </p>
          </div>
        </div>

        {isToday && (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-white/5">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Hari Ini</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Week Section ─────────────────────────────────────────────────────────────

function WeekSection({
  label,
  monday,
  jadwalMap,
  todayStr,
}: {
  label: string;
  monday: Date;
  jadwalMap: Map<string, JadwalItem>;
  todayStr: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase whitespace-nowrap">
          {label} ({formatDateRange(monday)})
        </h2>
        <div className="flex-grow h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HARI_ORDER.map((hari, idx) => {
          const date = getDateForIndex(monday, idx);
          const dateStr = date.toISOString().split("T")[0];
          const jadwal = jadwalMap.get(hari) ?? null;
          const isToday = dateStr === todayStr;
          return (
            <ScheduleCard
              key={hari}
              hari={hari}
              date={date}
              jadwal={jadwal}
              isToday={isToday}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JadwalDokterPage() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dokter/jadwal")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setJadwal(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  // Build a map: hari → jadwal item
  const jadwalMap = useMemo(() => {
    const m = new Map<string, JadwalItem>();
    jadwal.forEach((j) => m.set(j.hari, j));
    return m;
  }, [jadwal]);

  // Dates
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const thisMonday = getWeekMonday(today);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);

  const currentMonth = `${MONTHS_ID[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Jadwal Praktik Saya
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Kelola jam praktik dan pantau pasien terdaftar Anda.
            </p>
          </div>

          {/* Month pill (decorative) */}
          <div className="relative inline-block">
            <button className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-white dark:hover:bg-white/10 transition-all duration-200 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm">
              <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              {currentMonth}
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="space-y-10">
            {[0, 1].map((w) => (
              <section key={w}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-3 w-48 animate-pulse bg-slate-200 dark:bg-white/10 rounded-full" />
                  <div className="flex-grow h-px bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ScheduleCardSkeleton key={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : jadwal.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl backdrop-blur-md text-center px-6">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
              Jadwal Belum Tersedia
            </h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Jadwal praktik Anda belum diatur oleh admin. Silakan hubungi admin untuk pembaruan jadwal terbaru.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            <WeekSection
              label="Minggu Ini"
              monday={thisMonday}
              jadwalMap={jadwalMap}
              todayStr={todayStr}
            />
            <WeekSection
              label="Minggu Depan"
              monday={nextMonday}
              jadwalMap={jadwalMap}
              todayStr={todayStr}
            />
          </div>
        )}
      </div>
    </div>
  );
}
