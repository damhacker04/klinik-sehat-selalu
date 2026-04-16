"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  HeartPulse,
  Thermometer,
  Weight,
  Activity,
  StickyNote,
  ClipboardX,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiwayatItem {
  id_rekam: number;
  id_pasien: number;
  tekanan_darah: string | null;
  suhu: number | null;
  berat_badan: number | null;
  catatan: string | null;
  kontrol_lanjutan: boolean;
  tanggal_periksa: string;
  pasien: { nama: string } | null;
}

// ─── Style constants ──────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Vital Pill ───────────────────────────────────────────────────────────────

function VitalPill({
  label,
  value,
  unit,
  wide,
}: {
  label: string;
  value: string | number | null;
  unit: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center${wide ? " col-span-2 md:col-span-1" : ""}`}
    >
      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-slate-800 dark:text-white">
          {value ?? "—"}
        </span>
        {value != null && (
          <span className="text-[10px] text-slate-400">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerawatRiwayatPage() {
  const router = useRouter();
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/perawat/pemeriksaan")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      (item.pasien?.nama ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Header ── */}
        <header className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Riwayat Pemeriksaan Pasien
          </h1>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama pasien..."
                className={`${GLASS} w-full pl-11 pr-5 py-3.5 rounded-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/40 focus:border-primary/60 outline-none transition-all`}
              />
            </div>
          </div>
        </header>

        {/* ── List ── */}
        <section className="space-y-4 md:space-y-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <ClipboardX className="w-9 h-9 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {search ? "Tidak Ada Hasil" : "Belum Ada Riwayat"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  {search
                    ? `Tidak ditemukan pasien dengan nama "${search}".`
                    : "Riwayat pemeriksaan yang telah selesai akan muncul di sini."}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id_rekam}
                onClick={() => router.push(`/perawat/riwayat/${item.id_rekam}`)}
                className={`group ${GLASS} rounded-3xl p-5 md:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:bg-white/90 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20`}
              >
                {/* Date + status + chevron */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {fmtDate(item.tanggal_periksa)}
                    </span>
                    <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      Selesai
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                </div>

                {/* Patient name */}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-5">
                  {item.pasien?.nama ?? "Pasien"}
                </h2>

                {/* Vitals pills */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-4">
                  <VitalPill label="TD" value={item.tekanan_darah} unit="mmHg" />
                  <VitalPill label="Suhu" value={item.suhu} unit="°C" />
                  <VitalPill label="Nadi" value={null} unit="bpm" />
                  <VitalPill label="BB" value={item.berat_badan} unit="kg" />
                  <VitalPill label="TB" value={null} unit="cm" wide />
                </div>

                {/* Catatan */}
                {item.catatan && (
                  <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 italic">
                    <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{item.catatan}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        {/* Footer */}
        <footer className="text-center pb-4">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Sistem Informasi Manajemen Klinik © 2024
          </p>
        </footer>
      </div>
    </div>
  );
}
