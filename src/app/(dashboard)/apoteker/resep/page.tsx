"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  CheckCircle2,
  Filter,
  Pill,
  AlertCircle,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailResep {
  id_detail: number;
  id_resep: number;
  id_obat: number;
  jumlah: number;
  dosis: string | null;
  obat: { nama_obat: string } | null;
}

interface ResepItem {
  id_resep: number;
  status: "pending" | "processing" | "completed" | "rejected";
  tanggal_resep: string;
  detail_resep: DetailResep[];
  rekam_medis: { pasien: { nama: string } | null } | null;
}

interface ObatStok {
  id_obat: number;
  stok: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  return `${Math.floor(hours / 24)} hari yang lalu`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: ResepItem["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: "Menunggu",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    processing: { label: "Diproses",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    completed:  { label: "Selesai",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    rejected:   { label: "Ditolak",   cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  sub,
  onClose,
}: {
  message: string;
  sub: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 animate-[bounceIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] max-w-sm w-[calc(100vw-2rem)] sm:w-auto">
      <style>{`
        @keyframes bounceIn {
          0%   { transform: translateY(100%) scale(0.9); opacity: 0; }
          70%  { transform: translateY(-5%) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      <div className="bg-emerald-50/95 dark:bg-emerald-900/25 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 flex items-center gap-4">
        <div className="shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{message}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">{sub}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-emerald-500 hover:text-emerald-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-white/8 ${className ?? ""}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-9 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-10 w-32 rounded-full" />)}
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
            <div className="flex gap-3"><SkeletonBlock className="h-6 w-10" /><SkeletonBlock className="h-6 w-20" /></div>
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <div className="p-6 space-y-3">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-24 w-full rounded-xl" />
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
            <SkeletonBlock className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Prescription Card ────────────────────────────────────────────────────────

function ResepCard({
  resep,
  stokMap,
  onAction,
  submitting,
}: {
  resep: ResepItem;
  stokMap: Record<number, number>;
  onAction: (id: number, status: "processing" | "completed" | "rejected") => void;
  submitting: number | null;
}) {
  const patientName = resep.rekam_medis?.pasien?.nama ?? "Pasien Tidak Diketahui";
  const details = resep.detail_resep ?? [];

  // Check if all items have sufficient stock
  const hasInsufficientStock = details.some((d) => {
    const available = stokMap[d.id_obat] ?? 0;
    return available < d.jumlah;
  });

  const isProcessing = submitting === resep.id_resep;

  return (
    <article className="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Card Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary dark:text-blue-400">
            #{resep.id_resep}
          </span>
          <StatusChip status={resep.status} />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Clock className="h-4 w-4" />
          <span>{timeAgo(resep.tanggal_resep)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Pasien
            </p>
            <p className="font-semibold text-lg text-slate-900 dark:text-white leading-tight">
              {patientName}
            </p>
          </div>
          {details.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                Jumlah Item
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {details.length} item obat
              </p>
            </div>
          )}
          {hasInsufficientStock && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Stok tidak mencukupi
              </p>
            </div>
          )}
        </div>

        {/* Medicine Table */}
        <div className="lg:col-span-8">
          {details.length > 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nama Obat</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Dosis</th>
                    <th className="px-4 py-3 font-semibold text-center">Jml</th>
                    <th className="px-4 py-3 font-semibold text-center">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {details.map((d) => {
                    const available = stokMap[d.id_obat] ?? null;
                    const sufficient = available === null || available >= d.jumlah;
                    return (
                      <tr
                        key={d.id_detail}
                        className={!sufficient ? "bg-red-50 dark:bg-red-900/20" : ""}
                      >
                        <td className={`px-4 py-3 font-medium ${!sufficient ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-slate-100"}`}>
                          {d.obat?.nama_obat ?? "—"}
                        </td>
                        <td className={`px-4 py-3 hidden sm:table-cell ${!sufficient ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}`}>
                          {d.dosis ?? "—"}
                        </td>
                        <td className={`px-4 py-3 text-center font-semibold ${!sufficient ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
                          {d.jumlah}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sufficient ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
              Tidak ada item obat
            </div>
          )}
        </div>
      </div>

      {/* Card Footer — Actions */}
      {(resep.status === "pending" || resep.status === "processing") && (
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50/30 dark:bg-transparent">
          <button
            onClick={() => onAction(resep.id_resep, "rejected")}
            disabled={isProcessing}
            className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200"
          >
            Tolak Resep
          </button>
          {resep.status === "pending" && (
            <button
              onClick={() => onAction(resep.id_resep, "processing")}
              disabled={isProcessing}
              className="px-5 py-2 bg-primary hover:bg-blue-700 active:scale-95 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Mulai Proses
            </button>
          )}
          {resep.status === "processing" && (
            <button
              onClick={() => !hasInsufficientStock && onAction(resep.id_resep, "completed")}
              disabled={hasInsufficientStock || isProcessing}
              className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                hasInsufficientStock
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Tandai Selesai
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Read-only Card (Selesai tab) ─────────────────────────────────────────────

function RiwayatCard({ resep }: { resep: ResepItem }) {
  const patientName = resep.rekam_medis?.pasien?.nama ?? "Pasien Tidak Diketahui";
  const details = resep.detail_resep ?? [];

  return (
    <article className="bg-white dark:bg-slate-800/40 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-200">
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-500 dark:text-slate-400">#{resep.id_resep}</span>
          <StatusChip status={resep.status} />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Clock className="h-4 w-4" />
          <span>{timeAgo(resep.tanggal_resep)}</span>
        </div>
      </div>
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Pasien</p>
          <p className="font-semibold text-slate-900 dark:text-white">{patientName}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{details.length} item obat</p>
        </div>
        <div className="lg:col-span-8">
          {details.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Nama Obat</th>
                    <th className="px-4 py-2.5 font-semibold hidden sm:table-cell">Dosis</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Jml</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {details.map((d) => (
                    <tr key={d.id_detail}>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{d.obat?.nama_obat ?? "—"}</td>
                      <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{d.dosis ?? "—"}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-300">{d.jumlah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "pending" | "processing" | "completed";

export default function ApotekerResepPage() {
  const [activeResep, setActiveResep] = useState<ResepItem[]>([]);
  const [riwayat, setRiwayat] = useState<ResepItem[]>([]);
  const [stokMap, setStokMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [resepRes, riwayatRes, stokRes] = await Promise.all([
        fetch("/api/apoteker/resep"),
        fetch("/api/apoteker/riwayat"),
        fetch("/api/apoteker/stok"),
      ]);
      if (resepRes.ok) setActiveResep(await resepRes.json());
      if (riwayatRes.ok) setRiwayat(await riwayatRes.json());
      if (stokRes.ok) {
        const stokData: ObatStok[] = await stokRes.json();
        const map: Record<number, number> = {};
        (Array.isArray(stokData) ? stokData : []).forEach((o) => { map[o.id_obat] = o.stok; });
        setStokMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch resep data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(
    id_resep: number,
    status: "processing" | "completed" | "rejected"
  ) {
    setSubmitting(id_resep);
    try {
      const res = await fetch("/api/apoteker/resep", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_resep, status }),
      });
      if (res.ok) {
        const msg =
          status === "completed"
            ? { message: "Resep Berhasil Diselesaikan!", sub: "Data stok telah diperbarui otomatis." }
            : status === "rejected"
            ? { message: "Resep Ditolak", sub: "Resep telah ditolak dan tidak akan diproses." }
            : { message: "Resep Sedang Diproses", sub: "Status resep telah diperbarui." };
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
        // After completing, switch to selesai tab
        if (status === "completed") setActiveTab("completed");
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to update resep:", err);
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) return <LoadingSkeleton />;

  const pending = activeResep.filter((r) => r.status === "pending");
  const processing = activeResep.filter((r) => r.status === "processing");
  const completed = riwayat.filter((r) => r.status === "completed" || r.status === "rejected");

  const tabs: { key: Tab; label: string; count: number; color: string; activeCls: string; dotCls: string }[] = [
    {
      key: "pending",
      label: "Menunggu",
      count: pending.length,
      color: "amber",
      activeCls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/50",
      dotCls: "bg-amber-500",
    },
    {
      key: "processing",
      label: "Diproses",
      count: processing.length,
      color: "blue",
      activeCls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-2 ring-primary",
      dotCls: "bg-blue-500",
    },
    {
      key: "completed",
      label: "Selesai",
      count: completed.length,
      color: "emerald",
      activeCls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/50",
      dotCls: "bg-emerald-500",
    },
  ];

  const currentList =
    activeTab === "pending"
      ? pending
      : activeTab === "processing"
      ? processing
      : completed;

  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resep Masuk
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Kelola dan verifikasi resep obat dari dokter.
          </p>
        </div>
        {/* Filter (decorative) */}
        <div className="relative inline-flex items-center">
          <select className="appearance-none bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/20">
            <option>Semua Unit</option>
            <option>Rawat Jalan</option>
            <option>IGD</option>
            <option>Rawat Inap</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </header>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <nav className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:ring-2 ${
              activeTab === tab.key
                ? tab.activeCls
                : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
            }`}
          >
            {tab.label}
            <span className={`${tab.dotCls} text-white px-2 py-0.5 rounded-full text-xs font-bold min-w-[1.25rem] text-center`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <Pill className="h-14 w-14 opacity-30" />
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
              Tidak Ada Resep{" "}
              {activeTab === "pending"
                ? "Menunggu"
                : activeTab === "processing"
                ? "Diproses"
                : "Selesai"}
            </p>
            <p className="text-sm text-center max-w-xs">
              {activeTab === "pending"
                ? "Resep baru dari dokter akan muncul di sini."
                : activeTab === "processing"
                ? "Belum ada resep yang sedang diproses."
                : "Riwayat resep yang telah diproses akan tampil di sini."}
            </p>
          </div>
        ) : activeTab === "completed" ? (
          completed.map((r) => <RiwayatCard key={r.id_resep} resep={r} />)
        ) : (
          currentList.map((r) => (
            <ResepCard
              key={r.id_resep}
              resep={r}
              stokMap={stokMap}
              onAction={handleAction}
              submitting={submitting}
            />
          ))
        )}
      </section>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          sub={toast.sub}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
