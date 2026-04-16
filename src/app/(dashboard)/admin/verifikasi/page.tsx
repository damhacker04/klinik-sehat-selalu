"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  Calendar,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  History,
  Loader2,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface FormPendaftaran {
  id: number;
  nama: string;
  tanggal: string;
  keluhan: string;
  permintaan_khusus: string | null;
  status: string;
}

const ITEMS_PER_PAGE = 5;

const GLASS =
  "bg-white/80 dark:bg-[rgba(26,31,55,0.7)] backdrop-blur-md border border-slate-200 dark:border-white/10";

function getBadgeType(permintaan_khusus: string | null) {
  const val = (permintaan_khusus || "").toLowerCase();
  if (val.includes("bpjs"))
    return {
      label: "BPJS",
      className:
        "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30",
    };
  if (val.includes("asuransi"))
    return {
      label: "Asuransi",
      className:
        "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30",
    };
  return {
    label: "Umum",
    className:
      "bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-400/30",
  };
}

export default function VerifikasiPage() {
  const [pending, setPending] = useState<FormPendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"menunggu" | "riwayat">(
    "menunggu"
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verifikasi");
      if (res.ok) setPending(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter + paginate
  const filtered = pending.filter((f) =>
    f.nama.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleAction(id_form: number, action: "approve" | "reject") {
    setProcessingIds((prev) => new Set(prev).add(id_form));
    try {
      const res = await fetch("/api/admin/verifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_form, action }),
      });
      if (res.ok) {
        toast.success(
          action === "approve"
            ? "Pendaftaran berhasil disetujui"
            : "Pendaftaran ditolak"
        );
        await fetchData();
        setSelectedIds((prev) => {
          const s = new Set(prev);
          s.delete(id_form);
          return s;
        });
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memproses");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setProcessingIds((prev) => {
        const s = new Set(prev);
        s.delete(id_form);
        return s;
      });
    }
  }

  async function handleBulkAction(action: "approve" | "reject") {
    const ids = [...selectedIds];
    setBulkProcessing(true);
    let successCount = 0;
    for (const id of ids) {
      try {
        const res = await fetch("/api/admin/verifikasi", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_form: id, action }),
        });
        if (res.ok) successCount++;
      } catch {
        // continue processing remaining
      }
    }
    toast.success(
      `${successCount} pendaftaran ${
        action === "approve" ? "berhasil disetujui" : "ditolak"
      }`
    );
    setSelectedIds(new Set());
    setBulkProcessing(false);
    await fetchData();
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  function toggleSelectAll() {
    if (
      paginated.length > 0 &&
      paginated.every((f) => selectedIds.has(f.id))
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((f) => f.id)));
    }
  }

  const allPageSelected =
    paginated.length > 0 && paginated.every((f) => selectedIds.has(f.id));

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${GLASS} rounded-2xl p-5 animate-pulse`}>
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
              <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-4 w-60 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Verifikasi Pendaftaran
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review dan verifikasi form pendaftaran pasien yang masuk
        </p>
      </div>

      {/* Search + Tabs row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pasien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200 dark:border-white/10 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab("menunggu")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === "menunggu"
                ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Menunggu
            {pending.length > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "menunggu"
                    ? "bg-primary/20 dark:bg-white/20 text-primary dark:text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === "riwayat"
                ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "riwayat" ? (
        /* Riwayat tab — API only returns pending; show informative empty state */
        <div
          className={`${GLASS} rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4`}
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <History className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
              Belum Ada Riwayat
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Riwayat pendaftaran yang sudah diproses dapat dilihat di halaman{" "}
              <a
                href="/admin/laporan"
                className="text-primary hover:underline font-medium"
              >
                Laporan
              </a>
              .
            </p>
          </div>
        </div>
      ) : (
        /* Menunggu tab */
        <>
          {/* Select all row */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center ${
                      allPageSelected
                        ? "bg-primary border-primary"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary/60 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {allPageSelected && (
                      <Check
                        className="w-3 h-3 text-white"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Pilih Semua ({paginated.length})
                </span>
              </label>
              {selectedIds.size > 0 && (
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  — {selectedIds.size} dipilih
                </span>
              )}
            </div>
          )}

          {/* Cards */}
          {paginated.length === 0 ? (
            <div
              className={`${GLASS} rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4`}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ClipboardCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
                  {search
                    ? "Tidak Ditemukan"
                    : "Tidak Ada Pendaftaran Menunggu"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  {search
                    ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                    : "Semua pendaftaran sudah diverifikasi. Pendaftaran baru akan muncul di sini."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((form) => {
                const badge = getBadgeType(form.permintaan_khusus);
                const isSelected = selectedIds.has(form.id);
                const isProcessing = processingIds.has(form.id);
                return (
                  <div
                    key={form.id}
                    className={`${GLASS} rounded-2xl p-5 flex flex-col lg:flex-row items-start gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 dark:bg-[rgba(19,55,236,0.12)]"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                      {/* Checkbox */}
                      <div className="pt-1 flex-shrink-0">
                        <label className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(form.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 transition-all duration-150 flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-slate-300 dark:border-slate-600 hover:border-primary/60 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && (
                              <Check
                                className="w-3 h-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                            {form.nama}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{form.tanggal}</span>
                        </div>
                        {form.keluhan && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              Keluhan:{" "}
                            </span>
                            {form.keluhan}
                          </p>
                        )}
                        {form.permintaan_khusus && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Catatan: {form.permintaan_khusus}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 lg:ml-4 w-full lg:w-auto justify-end">
                      <button
                        onClick={() => handleAction(form.id, "reject")}
                        disabled={isProcessing || bulkProcessing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Tolak
                      </button>
                      <button
                        onClick={() => handleAction(form.id, "approve")}
                        disabled={isProcessing || bulkProcessing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all duration-150 shadow-sm shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Setujui
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 ${
                    page === i + 1
                      ? "bg-primary/20 dark:bg-primary/30 text-primary dark:text-blue-300 font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`${GLASS} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl shadow-slate-900/20`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                Pendaftaran dipilih
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleBulkAction("reject")}
                disabled={bulkProcessing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-150 disabled:opacity-50 whitespace-nowrap"
              >
                {bulkProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Tolak Terpilih</span>
                <span className="sm:hidden">Tolak</span>
              </button>
              <button
                onClick={() => handleBulkAction("approve")}
                disabled={bulkProcessing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all duration-150 shadow-sm shadow-primary/30 disabled:opacity-50 whitespace-nowrap"
              >
                {bulkProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Setujui Terpilih</span>
                <span className="sm:hidden">Setujui</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
