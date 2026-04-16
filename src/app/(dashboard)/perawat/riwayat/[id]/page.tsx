"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Printer,
  X,
  HeartPulse,
  Thermometer,
  Weight,
  Ruler,
  Activity,
  BarChart3,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiwayatDetail {
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

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("id-ID", opts ?? {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
}

function rmId(id: number) {
  return `RM-${String(id).padStart(6, "0")}`;
}

// ─── Vital Card ───────────────────────────────────────────────────────────────

function VitalCard({
  icon,
  iconBg,
  iconColor,
  value,
  unit,
  label,
  badge,
  badgeColor,
  primary,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number | null;
  unit?: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`${
        primary
          ? "bg-primary/10 dark:bg-[rgba(19,55,236,0.15)] border border-primary/30 dark:border-primary/40"
          : `${GLASS} hover:border-primary/40 dark:hover:border-primary/30`
      } rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value != null ? (
            <>
              {value}
              {unit && (
                <span className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 ml-0.5">
                  {unit}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-300 dark:text-slate-600">—</span>
          )}
        </p>
        <p
          className={`text-[11px] font-bold uppercase tracking-wide mt-1 ${
            primary
              ? "text-primary"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse space-y-6">
      <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-9 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Print Modal ──────────────────────────────────────────────────────────────

function PrintModal({
  item,
  onClose,
}: {
  item: RiwayatDetail;
  onClose: () => void;
}) {
  const nama = item.pasien?.nama ?? "Pasien";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${GLASS} w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200`}
      >
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-800 dark:text-white">
              Pratinjau Cetak Rekam Medis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper preview */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-100 dark:bg-slate-900/50">
          <div className="bg-white text-slate-900 w-full max-w-[700px] mx-auto shadow-xl p-8 md:p-12 rounded-lg flex flex-col gap-7">
            {/* Clinic header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                  <span className="text-xl font-bold">K</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight">
                    Klinik Sehat Selalu
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Jl. Kesehatan No. 123, Jakarta Selatan | (021) 555-0123
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-base font-bold text-slate-400 uppercase">
                  Rekam Medis
                </h2>
                <p className="text-sm font-bold">#{rmId(item.id_rekam)}</p>
              </div>
            </div>

            {/* Patient meta */}
            <div className="grid grid-cols-2 gap-6 py-3 px-4 bg-slate-50 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Nama Pasien
                </p>
                <p className="font-bold text-base">{nama}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  No. Rekam Medis
                </p>
                <p className="font-bold text-base text-primary">
                  {rmId(item.id_rekam)}
                </p>
                <p className="text-xs italic text-slate-500">
                  Tanggal Periksa: {fmtDate(item.tanggal_periksa)}
                </p>
              </div>
            </div>

            {/* Vitals */}
            <div className="space-y-3">
              <h3 className="font-bold border-b border-slate-200 pb-2 text-xs uppercase tracking-widest">
                Tanda-Tanda Vital
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <div className="border-l-2 border-red-500 pl-4">
                  <p className="text-xs text-slate-500">Tekanan Darah</p>
                  <p className="text-lg font-bold">
                    {item.tekanan_darah ?? "—"}{" "}
                    {item.tekanan_darah && (
                      <span className="text-xs font-normal">mmHg</span>
                    )}
                  </p>
                </div>
                <div className="border-l-2 border-rose-500 pl-4">
                  <p className="text-xs text-slate-500">Detak Jantung</p>
                  <p className="text-lg font-bold">—</p>
                </div>
                <div className="border-l-2 border-orange-500 pl-4">
                  <p className="text-xs text-slate-500">Suhu Tubuh</p>
                  <p className="text-lg font-bold">
                    {item.suhu ?? "—"}{" "}
                    {item.suhu != null && (
                      <span className="text-xs font-normal">°C</span>
                    )}
                  </p>
                </div>
                <div className="border-l-2 border-blue-500 pl-4">
                  <p className="text-xs text-slate-500">Berat Badan</p>
                  <p className="text-lg font-bold">
                    {item.berat_badan ? `${item.berat_badan} kg` : "—"}
                  </p>
                </div>
                <div className="border-l-2 border-emerald-500 pl-4">
                  <p className="text-xs text-slate-500">Tinggi Badan</p>
                  <p className="text-lg font-bold">—</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <p className="text-xs text-slate-500">BMI</p>
                  <p className="text-lg font-bold">—</p>
                </div>
              </div>
            </div>

            {/* Catatan */}
            {item.catatan && (
              <div className="space-y-3">
                <h3 className="font-bold border-b border-slate-200 pb-2 text-xs uppercase tracking-widest">
                  Catatan Pemeriksaan
                </h3>
                <p className="text-sm leading-relaxed italic text-slate-700">
                  "{item.catatan}"
                </p>
              </div>
            )}

            {/* Signature */}
            <div className="mt-4 flex justify-end">
              <div className="text-center w-56 border-t border-slate-200 pt-4">
                <p className="text-xs italic text-slate-400 mb-14">
                  Tanda tangan Perawat
                </p>
                <p className="font-bold text-sm">( __________________ )</p>
                <p className="text-xs text-slate-500 mt-1">Perawat Pemeriksa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 md:px-8 py-5 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-white/50 dark:bg-white/5">
          <button
            onClick={onClose}
            className={`${GLASS} px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all`}
          >
            Batal
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Sekarang
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RiwayatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<RiwayatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const targetId = parseInt(id, 10);
    fetch("/api/perawat/pemeriksaan")
      .then((r) => r.ok ? r.json() : [])
      .then((data: RiwayatDetail[]) => {
        const found = Array.isArray(data)
          ? data.find((d) => d.id_rekam === targetId) ?? null
          : null;
        if (found) setItem(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (notFound || !item) {
    return (
      <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Data Tidak Ditemukan
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rekam medis dengan ID tersebut tidak ditemukan.
          </p>
          <button
            onClick={() => router.push("/perawat/riwayat")}
            className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const nama = item.pasien?.nama ?? "Pasien";

  // Initials avatar
  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2">
            <button
              onClick={() => router.push("/perawat/riwayat")}
              className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Kembali ke Daftar Pasien
            </button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Detail Pemeriksaan Pasien
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrint(true)}
              className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak Rekam</span>
            </button>
          </div>
        </div>

        {/* ── Patient info card ── */}
        <div
          className={`${GLASS} rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center border-l-4 border-l-primary`}
        >
          {/* Initials avatar */}
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center">
            <span className="text-xl md:text-2xl font-bold text-primary">
              {initials}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 flex-1 gap-4 md:gap-6 w-full">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">
                Nama Pasien
              </span>
              <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                {nama}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">
                No. Rekam Medis
              </span>
              <span className="text-base md:text-lg font-mono font-bold text-primary">
                {rmId(item.id_rekam)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">
                Waktu Pemeriksaan
              </span>
              <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                {fmtDate(item.tanggal_periksa)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {fmtTime(item.tanggal_periksa)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs w-fit border border-emerald-500/20 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Selesai
              </span>
            </div>
          </div>
        </div>

        {/* ── Main grid: vitals + catatan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Vitals + Catatan */}
          <div className="lg:col-span-2 space-y-5">

            {/* Vital Signs */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                Tanda-Tanda Vital
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                <VitalCard
                  icon={<HeartPulse className="w-5 h-5" />}
                  iconBg="bg-red-500/10"
                  iconColor="text-red-400"
                  value={item.tekanan_darah}
                  label="Tekanan Darah (mmHg)"
                  badge={item.tekanan_darah ? "Normal" : undefined}
                  badgeColor="text-red-400 bg-red-400/10"
                />
                <VitalCard
                  icon={<Activity className="w-5 h-5" />}
                  iconBg="bg-rose-500/10"
                  iconColor="text-rose-400"
                  value={null}
                  unit="bpm"
                  label="Detak Jantung (bpm)"
                />
                <VitalCard
                  icon={<Thermometer className="w-5 h-5" />}
                  iconBg="bg-orange-500/10"
                  iconColor="text-orange-400"
                  value={item.suhu}
                  unit="°C"
                  label="Suhu Tubuh"
                />
                <VitalCard
                  icon={<Weight className="w-5 h-5" />}
                  iconBg="bg-blue-500/10"
                  iconColor="text-blue-400"
                  value={item.berat_badan}
                  unit="kg"
                  label="Berat Badan"
                />
                <VitalCard
                  icon={<Ruler className="w-5 h-5" />}
                  iconBg="bg-emerald-500/10"
                  iconColor="text-emerald-400"
                  value={null}
                  unit="cm"
                  label="Tinggi Badan"
                />
                <VitalCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  iconBg="bg-primary"
                  iconColor="text-white"
                  value={null}
                  label="Indeks Massa Tubuh (BMI)"
                  primary
                />
              </div>
            </div>

            {/* Catatan */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                Catatan Pemeriksaan
              </h3>
              <div className={`${GLASS} rounded-2xl p-5 md:p-6 space-y-4`}>
                <div>
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                    Catatan Perawat
                  </h4>
                  {item.catatan ? (
                    <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-200 italic">
                      &ldquo;{item.catatan}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                      Tidak ada catatan untuk pemeriksaan ini.
                    </p>
                  )}
                </div>
                {item.kontrol_lanjutan && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />
                    <div>
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                        Tindak Lanjut
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        Pasien memerlukan kontrol lanjutan.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info rekam medis */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              Info Rekam Medis
            </h3>
            <div className={`${GLASS} rounded-2xl overflow-hidden`}>
              <div className="p-5 md:p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      ID Rekam Medis
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {rmId(item.id_rekam)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      Status Pemeriksaan
                    </p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      Selesai
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      Kontrol Lanjutan
                    </p>
                    <p className={`font-bold text-sm ${item.kontrol_lanjutan ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}`}>
                      {item.kontrol_lanjutan ? "Diperlukan" : "Tidak Diperlukan"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 dark:bg-primary/10 px-5 py-3 border-t border-slate-200 dark:border-white/10">
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Diperiksa pada {fmtDate(item.tanggal_periksa)} — {fmtTime(item.tanggal_periksa)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print modal ── */}
      {showPrint && typeof window !== "undefined" && (
        <PrintModal item={item} onClose={() => setShowPrint(false)} />
      )}
    </div>
  );
}
