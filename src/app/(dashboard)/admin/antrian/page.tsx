"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Clock,
  Phone,
  CheckCircle2,
  PlayCircle,
  ClipboardCheck,
  Stethoscope,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface FormPendaftaran {
  id_pasien: number;
  keluhan: string;
  permintaan_khusus: string | null;
  pasien: { nama: string };
}

interface AntrianItem {
  id_antrian: number;
  nomor_antrian: number;
  status: "waiting" | "called" | "done";
  waktu_panggil: string | null;
  created_at: string;
  form_pendaftaran: FormPendaftaran;
}

interface Counts {
  waiting: number;
  called: number;
  done: number;
}

const GLASS =
  "bg-white/80 dark:bg-[rgba(25,30,51,0.7)] backdrop-blur-md border border-slate-200 dark:border-white/10";

function fmtQueueNum(n: number): string {
  return `A - ${String(n).padStart(3, "0")}`;
}

function fmtTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBadgeType(permintaan_khusus: string | null): string {
  const val = (permintaan_khusus || "").toLowerCase();
  if (val.includes("bpjs")) return "BPJS";
  if (val.includes("asuransi")) return "Asuransi";
  return "Reguler";
}

function formatClock(date: Date): string {
  const DAYS = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
  ];
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const day = DAYS[date.getDay()];
  const d = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${day}, ${d} ${month} ${year} — ${h}:${m}`;
}

export default function AdminAntrianPage() {
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ waiting: 0, called: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [now, setNow] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/antrian");
      if (res.ok) {
        const data = await res.json();
        setAntrian(data.antrian || []);
        setCounts(data.counts || { waiting: 0, called: 0, done: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch antrian:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 30_000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(clockInterval);
    };
  }, [fetchData]);

  async function handleAction(id_antrian: number, action: "call" | "done") {
    setProcessingId(id_antrian);
    try {
      const res = await fetch("/api/admin/antrian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_antrian, action }),
      });
      if (res.ok) {
        toast.success(
          action === "call" ? "Pasien dipanggil" : "Antrian selesai"
        );
        await fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memproses");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setProcessingId(null);
    }
  }

  // Derived data
  const calledItem = antrian.find((a) => a.status === "called") ?? null;
  const waitingItems = antrian
    .filter((a) => a.status === "waiting")
    .sort((a, b) => a.nomor_antrian - b.nomor_antrian);
  const displayedWaiting = showAll ? waitingItems : waitingItems.slice(0, 4);
  const total = counts.waiting + counts.called + counts.done;
  const attendancePct = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
            <div className="h-10 w-60 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 ${GLASS} rounded-2xl h-96 animate-pulse`} />
          <div className="space-y-3">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${GLASS} rounded-xl h-16 animate-pulse`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${GLASS} rounded-xl h-20 animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            Monitor Antrian Pusat
          </h1>
          <p className="text-primary font-semibold tracking-wide uppercase text-sm">
            Klinik Sehat Selalu • Command Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn((s) => !s)}
            title={soundOn ? "Matikan Suara" : "Aktifkan Suara"}
            className={`flex items-center justify-center w-10 h-10 ${GLASS} rounded-full transition-all duration-200 hover:scale-105 hover:border-primary/50 ${
              soundOn
                ? "text-slate-600 dark:text-slate-300"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Live clock */}
          <div
            className={`flex items-center gap-2 ${GLASS} px-4 py-2 rounded-full text-slate-500 dark:text-slate-400 text-sm flex-shrink-0`}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatClock(now)}</span>
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sedang Dilayani (2/3 width) */}
        <div className="lg:col-span-2">
          <div
            className={`${GLASS} rounded-2xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden`}
            style={{ minHeight: "380px", justifyContent: "center" }}
          >
            {/* Live indicator */}
            <div className="absolute top-0 right-0 p-5">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            </div>

            {calledItem ? (
              <>
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">
                  Sedang Dilayani
                </span>

                {/* Giant queue number */}
                <h2 className="text-slate-900 dark:text-white text-7xl md:text-9xl font-black tracking-tighter drop-shadow-sm mb-6">
                  {fmtQueueNum(calledItem.nomor_antrian)}
                </h2>

                {/* Patient info */}
                <div className="space-y-2 mb-10">
                  <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                    {calledItem.form_pendaftaran?.pasien?.nama ?? "Pasien"}
                  </h3>
                  {calledItem.form_pendaftaran?.keluhan && (
                    <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="line-clamp-1 max-w-xs">
                        {calledItem.form_pendaftaran.keluhan}
                      </span>
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
                  <button
                    onClick={() => handleAction(calledItem.id_antrian, "call")}
                    disabled={processingId !== null}
                    className={`flex-1 flex items-center justify-center gap-2 ${GLASS} hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingId === calledItem.id_antrian ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Phone className="w-5 h-5" />
                    )}
                    Panggil Ulang
                  </button>
                  <button
                    onClick={() => handleAction(calledItem.id_antrian, "done")}
                    disabled={processingId !== null}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === calledItem.id_antrian ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Selesai
                  </button>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
                  <ClipboardCheck className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
                    Belum Ada Antrian Dipanggil
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    {waitingItems.length > 0
                      ? "Panggil pasien berikutnya dari daftar antrian di samping."
                      : "Antrian kosong. Antrian baru muncul setelah pendaftaran diverifikasi."}
                  </p>
                </div>
                {waitingItems.length > 0 && (
                  <button
                    onClick={() =>
                      handleAction(waitingItems[0].id_antrian, "call")
                    }
                    disabled={processingId !== null}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-50 mt-2"
                  >
                    {processingId === waitingItems[0].id_antrian ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                    Panggil Berikutnya
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Antrian Selanjutnya (1/3 width) */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">
              Antrian Selanjutnya
            </h2>
            <span
              className={`${GLASS} px-3 py-1 rounded-full text-xs font-bold text-primary`}
            >
              {counts.waiting} Pasien
            </span>
          </div>

          {waitingItems.length === 0 ? (
            <div
              className={`${GLASS} rounded-xl p-8 flex flex-col items-center text-center gap-3`}
            >
              <Users className="w-8 h-8 text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tidak ada antrian menunggu
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayedWaiting.map((item) => {
                  const nama =
                    item.form_pendaftaran?.pasien?.nama ?? "Pasien";
                  const type = getBadgeType(
                    item.form_pendaftaran?.permintaan_khusus
                  );
                  const time = fmtTime(item.created_at);
                  const isProcessing = processingId === item.id_antrian;

                  return (
                    <div
                      key={item.id_antrian}
                      className={`${GLASS} p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">
                            A-{String(item.nomor_antrian).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">
                            {nama}
                          </p>
                          <p className="text-slate-500 dark:text-slate-500 text-xs">
                            {type} • {time}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleAction(item.id_antrian, "call")
                        }
                        disabled={processingId !== null}
                        title="Panggil Sekarang"
                        className="flex-shrink-0 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <PlayCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {waitingItems.length > 4 && (
                <button
                  onClick={() => setShowAll((s) => !s)}
                  className="w-full py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-medium transition-colors border-t border-slate-200 dark:border-white/5 mt-2"
                >
                  {showAll
                    ? "Sembunyikan"
                    : `Lihat Semua Antrian (${waitingItems.length})`}
                </button>
              )}
            </>
          )}
        </aside>
      </main>

      {/* ── Stats Footer ── */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Rata-rata Pelayanan */}
        <div className={`${GLASS} p-6 rounded-xl border-l-4 border-l-primary`}>
          <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mb-2 tracking-wide">
            Rata-rata Pelayanan
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-slate-900 dark:text-white font-bold">
              —
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              menit/pasien
            </span>
          </div>
        </div>

        {/* Pasien Selesai */}
        <div className={`${GLASS} p-6 rounded-xl border-l-4 border-l-green-500`}>
          <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mb-2 tracking-wide">
            Pasien Selesai
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-slate-900 dark:text-white font-bold">
              {counts.done}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              dari {total} total
            </span>
          </div>
        </div>

        {/* Status Kehadiran */}
        <div className={`${GLASS} p-6 rounded-xl border-l-4 border-l-yellow-500`}>
          <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase mb-2 tracking-wide">
            Status Kehadiran
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-slate-900 dark:text-white font-bold">
              {total > 0 ? `${attendancePct}%` : "—"}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              tingkat kehadiran
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
