"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  Search,
  SlidersHorizontal,
  FileText,
} from "lucide-react";

type RiwayatItem = {
  id_rekam: string;
  tanggal_periksa: string;
  diagnosa: string | null;
  catatan: string | null;
  dokter: { nama: string; spesialisasi: string | null } | null;
  resep: { status: string }[] | null;
};

function getStatus(resep: { status: string }[] | null) {
  if (!resep || resep.length === 0) return "selesai";
  const s = resep[0].status;
  if (s === "completed") return "selesai";
  if (s === "rejected") return "dibatalkan";
  return "proses";
}

const STATUS_LABEL: Record<string, string> = {
  selesai: "Selesai",
  proses: "Dalam Proses",
  dibatalkan: "Dibatalkan",
};

const STATUS_CLASS: Record<string, string> = {
  selesai:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  proses:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  dibatalkan: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const PAGE_SIZE = 4;

export default function RiwayatMedisPage() {
  const router = useRouter();
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/pasien/riwayat")
      .then((r) => r.json())
      .then((d) => setRiwayat(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = riwayat.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (item.diagnosa ?? "").toLowerCase().includes(q) ||
      (item.dokter?.nama ?? "").toLowerCase().includes(q);
    const status = getStatus(item.resep);
    const matchStatus = filterStatus === "semua" || status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function formatTanggal(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Rekam Medis Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau semua aktivitas kesehatan dan diagnosis Anda di satu tempat.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari diagnosis atau dokter..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 dark:bg-primary/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted/50 dark:bg-primary/10 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="selesai">Selesai</option>
              <option value="proses">Dalam Proses</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <FileText className="w-12 h-12 opacity-30" />
          <p className="text-sm">
            {riwayat.length === 0
              ? "Belum ada riwayat medis."
              : "Tidak ada riwayat yang cocok."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((item) => {
            const status = getStatus(item.resep);
            const isCancel = status === "dibatalkan";
            return (
              <div
                key={item.id_rekam}
                onClick={() => router.push(`/pasien/riwayat/${item.id_rekam}`)}
                className={`
                  group relative bg-card dark:bg-primary/5 border border-border dark:border-primary/10
                  rounded-xl p-5 cursor-pointer select-none
                  hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30
                  transition-all duration-200
                  ${isCancel ? "opacity-70" : ""}
                `}
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                  {/* Tanggal */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tanggal
                    </span>
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium">
                        {formatTanggal(item.tanggal_periksa)}
                      </span>
                    </div>
                  </div>

                  {/* Dokter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Dokter
                    </span>
                    <div className="flex items-center gap-2 text-foreground">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium truncate">
                        {item.dokter?.nama ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Klinik/Poli */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Klinik/Poli
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.dokter?.spesialisasi ?? "Poli Umum"}
                    </span>
                  </div>

                  {/* Diagnosis */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Diagnosis
                    </span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.diagnosa ?? "—"}
                    </span>
                  </div>

                  {/* Status + Chevron */}
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_CLASS[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            riwayat
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted dark:bg-primary/10 text-muted-foreground hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  page === i + 1
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-muted dark:bg-primary/10 text-muted-foreground hover:bg-primary/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted dark:bg-primary/10 text-muted-foreground hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
