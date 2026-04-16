"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Calendar,
  Filter,
  User,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  FileText,
  CheckCircle2,
  XCircle,
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

interface RiwayatItem {
  id_resep: number;
  status: "completed" | "rejected";
  tanggal_resep: string;
  catatan?: string | null;
  detail_resep: DetailResep[];
  rekam_medis: {
    pasien: { nama: string } | null;
    transaksi: { status: string } | null;
  } | null;
}

type DateFilter = "all" | "today" | "7days" | "month";
type StatusFilter = "all" | "completed" | "rejected";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Ags","Sep","Okt","Nov","Des",
  ];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm} WIB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Ags","Sep","Okt","Nov","Des",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-white/8 ${className ?? ""}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <Sk className="h-9 w-48" />
        <Sk className="h-4 w-72" />
      </div>
      <Sk className="h-12 w-full max-w-lg rounded-full" />
      <div className="flex gap-3">
        <Sk className="h-10 w-36 rounded-xl" />
        <Sk className="h-10 w-32 rounded-xl" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-white/3 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Sk className="h-5 w-20" />
                <Sk className="h-5 w-16 rounded-full" />
              </div>
              <Sk className="h-4 w-36" />
            </div>
            <Sk className="h-4 w-44" />
            <div className="flex gap-2">
              <Sk className="h-6 w-24 rounded-full" />
              <Sk className="h-6 w-28 rounded-full" />
              <Sk className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RiwayatItem["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
        <CheckCircle2 className="h-3 w-3" />
        Selesai
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
      <XCircle className="h-3 w-3" />
      Ditolak
    </span>
  );
}

// ─── Riwayat Card ─────────────────────────────────────────────────────────────

function RiwayatCard({
  item,
  onDetail,
}: {
  item: RiwayatItem;
  onDetail: (item: RiwayatItem) => void;
}) {
  const isRejected = item.status === "rejected";
  const patientName =
    item.rekam_medis?.pasien?.nama ?? "Pasien Tidak Diketahui";
  const details = item.detail_resep ?? [];
  const alasan =
    item.catatan ?? "Stok obat tidak tersedia atau dosis tidak valid.";

  return (
    <article
      className={`group bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-white/10 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-200 ${
        isRejected
          ? "border-l-4 border-l-red-500 dark:border-l-red-500"
          : ""
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            Resep #{item.id_resep}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {formatDateTime(item.tanggal_resep)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Patient */}
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {patientName}
            </span>
          </div>

          {/* Medicine Tags */}
          {details.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {details.map((d) => (
                <span
                  key={d.id_detail}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isRejected
                      ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 line-through"
                      : "bg-primary/10 text-primary dark:bg-blue-500/15 dark:text-blue-400 border-primary/20 dark:border-blue-500/20 group-hover:bg-primary/15 dark:group-hover:bg-blue-500/20"
                  }`}
                >
                  {d.obat?.nama_obat ?? "Obat"} ({d.jumlah})
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Tidak ada item obat</span>
          )}

          {/* Rejection reason */}
          {isRejected && (
            <p className="mt-2.5 text-xs text-red-500 dark:text-red-400 italic">
              Alasan: {alasan}
            </p>
          )}
        </div>

        {/* Detail Button */}
        <button
          onClick={() => onDetail(item)}
          className="inline-flex items-center gap-1 text-primary dark:text-blue-400 text-sm font-semibold hover:underline shrink-0 transition-colors hover:text-blue-700 dark:hover:text-blue-300"
        >
          Detail
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
}: {
  item: RiwayatItem;
  onClose: () => void;
}) {
  const patientName = item.rekam_medis?.pasien?.nama ?? "—";
  const details = item.detail_resep ?? [];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @media print {
          body > *:not(#print-receipt) { display: none !important; }
          #print-receipt {
            display: block !important;
            position: fixed !important;
            top: 0; left: 0;
            width: 100%; padding: 24px;
            background: white; color: black;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Panel */}
        <div
          className="bg-white dark:bg-[#1a1f36] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          style={{ animation: "fadeInScale 0.2s ease-out forwards" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1f36] rounded-t-3xl z-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Detail Resep #{item.id_resep}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Pasien
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {patientName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Dokter
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  —
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Tanggal
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {formatDate(item.tanggal_resep)}
                </p>
              </div>
            </div>

            {/* Medicine List */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Daftar Obat
              </p>
              {details.length > 0 ? (
                <div className="space-y-2">
                  {details.map((d) => (
                    <div
                      key={d.id_detail}
                      className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl p-3 gap-3 hover:border-primary/20 dark:hover:border-blue-500/20 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                          {d.obat?.nama_obat ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {d.dosis ?? "—"}
                        </p>
                      </div>
                      <span className="shrink-0 bg-primary/10 dark:bg-blue-500/15 text-primary dark:text-blue-400 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap">
                        {d.jumlah} Tab
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  Tidak ada item obat
                </p>
              )}
            </div>

            {/* Summary + Catatan */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total Item
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {details.length} Obat
                </span>
              </div>
              {item.catatan && (
                <div className="border-t border-slate-200 dark:border-white/8 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Catatan Apoteker
                  </p>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.catatan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-1 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 dark:border-white/15 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/25 active:scale-95 transition-all"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* ── Print-only receipt ── */}
      <div id="print-receipt" style={{ display: "none" }}>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            color: "#000",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #000",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "2px" }}
            >
              KLINIK SEHAT SELALU
            </div>
            <div style={{ fontSize: "12px" }}>Struk Resep Obat</div>
          </div>

          {/* Info */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
            <tbody>
              {[
                ["No. Resep", `#${item.id_resep}`],
                ["Pasien", patientName],
                ["Tanggal", formatDateTime(item.tanggal_resep)],
                ["Status", item.status === "completed" ? "Selesai" : "Ditolak"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: "2px 0", width: "40%" }}>{label}</td>
                  <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                    : {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Medicines */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "12px",
              border: "1px solid #000",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e5e5e5" }}>
                {["No", "Obat", "Dosis", "Jml"].map((h) => (
                  <th
                    key={h}
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "left",
                      fontSize: "12px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {details.map((d, idx) => (
                <tr key={d.id_detail}>
                  {[
                    idx + 1,
                    d.obat?.nama_obat ?? "—",
                    d.dosis ?? "—",
                    d.jumlah,
                  ].map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        border: "1px solid #000",
                        padding: "4px 6px",
                        fontSize: "12px",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: "8px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <span>Total Item</span>
              <span>{details.length} Obat</span>
            </div>
            {item.catatan && (
              <p style={{ marginTop: "6px", fontStyle: "italic" }}>
                Catatan: {item.catatan}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              marginTop: "16px",
              borderTop: "1px solid #000",
              paddingTop: "10px",
            }}
          >
            Terima kasih telah mempercayakan kesehatan Anda kepada kami.
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  children,
}: {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors hover:border-slate-300 dark:hover:border-white/20 cursor-pointer"
      >
        {children}
      </select>
      <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none rotate-90" />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const base =
    "h-9 min-w-[2.25rem] px-2 rounded-xl text-sm font-semibold transition-all duration-200 border flex items-center justify-center";
  const active = "bg-primary text-white border-primary shadow-md shadow-primary/20";
  const inactive =
    "bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-blue-400 hover:border-primary/30";
  const nav =
    "bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${base} ${nav}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`${base} ${page === p ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${base} ${nav}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

export default function ApotekerRiwayatPage() {
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedResep, setSelectedResep] = useState<RiwayatItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/apoteker/riwayat");
      if (res.ok) {
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error("Failed to fetch riwayat:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, statusFilter]);

  const filtered = useMemo(() => {
    let r = data;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (x) =>
          `${x.id_resep}`.includes(q) ||
          (x.rekam_medis?.pasien?.nama?.toLowerCase() ?? "").includes(q)
      );
    }

    const now = new Date();
    if (dateFilter === "today") {
      r = r.filter(
        (x) =>
          new Date(x.tanggal_resep).toDateString() === now.toDateString()
      );
    } else if (dateFilter === "7days") {
      const cutoff = new Date(now.getTime() - 7 * 86_400_000);
      r = r.filter((x) => new Date(x.tanggal_resep) >= cutoff);
    } else if (dateFilter === "month") {
      r = r.filter((x) => {
        const d = new Date(x.tanggal_resep);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    if (statusFilter !== "all") {
      r = r.filter((x) => x.status === statusFilter);
    }

    return r;
  }, [data, search, dateFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Riwayat Resep
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
          Kelola dan tinjau seluruh resep obat pasien.
        </p>
      </header>

      {/* ── Search + Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor resep atau nama pasien..."
            className="w-full bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:border-slate-300 dark:hover:border-white/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <FilterSelect
            icon={Calendar}
            value={dateFilter}
            onChange={(v) => setDateFilter(v as DateFilter)}
          >
            <option value="all">Semua Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="month">Bulan Ini</option>
          </FilterSelect>

          <FilterSelect
            icon={Filter}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="rejected">Ditolak</option>
          </FilterSelect>
        </div>
      </div>

      {/* ── Results count ─────────────────────────────────────────────────── */}
      {(search || dateFilter !== "all" || statusFilter !== "all") && (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Menampilkan{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {filtered.length}
          </span>{" "}
          hasil
          {filtered.length !== data.length && (
            <> dari {data.length} total resep</>
          )}
        </p>
      )}

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-5 rounded-full bg-slate-100 dark:bg-white/5">
              <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
              Tidak Ada Riwayat Resep
            </p>
            <p className="text-sm text-center max-w-xs text-slate-400 dark:text-slate-500">
              {search || dateFilter !== "all" || statusFilter !== "all"
                ? "Tidak ada resep yang sesuai dengan filter yang dipilih."
                : "Riwayat resep yang telah diproses akan muncul di sini."}
            </p>
            {(search || dateFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setDateFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-1 px-5 py-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          paginated.map((item) => (
            <RiwayatCard
              key={item.id_resep}
              item={item}
              onDetail={setSelectedResep}
            />
          ))
        )}
      </section>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="pt-2 pb-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {selectedResep && (
        <DetailModal
          item={selectedResep}
          onClose={() => setSelectedResep(null)}
        />
      )}
    </div>
  );
}
