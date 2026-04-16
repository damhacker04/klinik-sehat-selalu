"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
} from "lucide-react";

interface ObatRow {
  id_obat: number;
  nama_obat: string;
  stok: number;
  harga: number;
  satuan: string | null;
  stok_minimum: number;
}

type StokFilter = "all" | "aman" | "kritis" | "habis";

type ToastType = {
  id: number;
  variant: "success" | "undo";
  title: string;
  message: string;
  undoAction?: () => void;
  countdown?: number;
};

const BLANK_FORM = {
  nama_obat: "",
  stok: "",
  harga: "",
  satuan: "Tablet",
  stok_minimum: "10",
};

const SATUAN_OPTIONS = ["Tablet", "Kapsul", "Sirup", "Botol", "Strip", "Ampul", "Sachet"];
const PER_PAGE = 10;

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function getStokStatus(stok: number, min: number): StokFilter {
  if (stok === 0) return "habis";
  if (stok <= min) return "kritis";
  return "aman";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-64 rounded-xl bg-slate-200 dark:bg-white/10 mb-2" />
          <div className="h-4 w-80 rounded-lg bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="h-12 w-36 rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 h-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="lg:col-span-3 h-12 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="lg:col-span-3 h-12 rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="bg-white/80 dark:bg-white/5 rounded-2xl overflow-hidden">
        <div className="h-14 bg-slate-100 dark:bg-white/10 mb-1" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-4 border-t border-slate-100 dark:border-white/5">
            <div className="h-5 flex-1 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-24 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-16 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-12 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-12 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal Overlay ────────────────────────────────────────────────────────────
function ModalOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl
          bg-white dark:bg-[#1a1f36] border border-slate-200/80 dark:border-white/20"
        style={{ animation: "fadeInScale 0.2s ease-out forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  item,
  onConfirm,
  onClose,
}: {
  item: ObatRow;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl
          bg-white dark:bg-[#1a1f36] border border-slate-200/80 dark:border-white/10"
        style={{ animation: "fadeInScale 0.2s ease-out forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Konfirmasi Hapus</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-300 mb-2">
          Apakah Anda yakin ingin menghapus data obat ini?
        </p>
        <p className="font-semibold text-slate-700 dark:text-white mb-8">
          &ldquo;{item.nama_obat}&rdquo;
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300
              bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold
              transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: ToastType[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return createPortal(
    <div className="fixed bottom-8 right-4 sm:right-8 z-[100] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl
            backdrop-blur-md border max-w-sm w-full
            ${toast.variant === "undo"
              ? "bg-red-50/90 dark:bg-[rgba(239,68,68,0.15)] border-red-300 dark:border-red-500/30"
              : "bg-emerald-50/90 dark:bg-[rgba(16,185,129,0.15)] border-emerald-300 dark:border-emerald-500/30"
            }`}
          style={{ animation: "fadeInScale 0.3s ease-out forwards" }}
        >
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
              ${toast.variant === "undo" ? "bg-red-100 dark:bg-red-500/20" : "bg-emerald-100 dark:bg-emerald-500/20"}`}
          >
            {toast.variant === "undo" ? (
              <Trash2 size={18} className="text-red-500" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white text-sm">{toast.title}</p>
            <p className="text-slate-500 dark:text-slate-300 text-xs truncate">{toast.message}</p>
          </div>
          {toast.variant === "undo" && toast.undoAction && (
            <button
              onClick={toast.undoAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20
                hover:bg-red-200 dark:hover:bg-red-500/30 transition-all active:scale-95"
            >
              <RotateCcw size={12} />
              Batalkan {toast.countdown != null && toast.countdown > 0 ? `(${toast.countdown}s)` : ""}
            </button>
          )}
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── Obat Form ────────────────────────────────────────────────────────────────
function ObatForm({
  form,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
}: {
  form: typeof BLANK_FORM;
  onChange: (f: typeof BLANK_FORM) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Obat */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
            Nama Obat <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="Contoh: Paracetamol 500mg"
            value={form.nama_obat}
            onChange={(e) => onChange({ ...form, nama_obat: e.target.value })}
            required
          />
        </div>
        {/* Stok Awal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
            Stok <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="0"
            value={form.stok}
            onChange={(e) => onChange({ ...form, stok: e.target.value })}
            required
          />
        </div>
        {/* Stok Minimum */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
            Stok Minimum
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="10"
            value={form.stok_minimum}
            onChange={(e) => onChange({ ...form, stok_minimum: e.target.value })}
          />
        </div>
        {/* Harga */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
              bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="5000"
            value={form.harga}
            onChange={(e) => onChange({ ...form, harga: e.target.value })}
            required
          />
        </div>
        {/* Satuan */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
            Satuan
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
              bg-white dark:bg-[#1a1f36] text-slate-800 dark:text-white cursor-pointer appearance-none
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={form.satuan}
            onChange={(e) => onChange({ ...form, satuan: e.target.value })}
          >
            {SATUAN_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
        <button
          type="button"
          className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300
            hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          onClick={() => (document.activeElement as HTMLElement)?.blur()}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl
            shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {submitting ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Stok Badge ───────────────────────────────────────────────────────────────
function StokBadge({ status }: { status: StokFilter }) {
  if (status === "habis")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/20">
        Habis
      </span>
    );
  if (status === "kritis")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
        Kritis
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
      Aman
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  function getPageNums() {
    const nums: (number | "...")[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (page > 3) nums.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) nums.push(i);
      if (page < pages - 2) nums.push("...");
      nums.push(pages);
    }
    return nums;
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
        Menampilkan <span className="font-semibold text-slate-700 dark:text-white">{start}</span> sampai{" "}
        <span className="font-semibold text-slate-700 dark:text-white">{end}</span> dari{" "}
        <span className="font-semibold text-slate-700 dark:text-white">{total}</span> obat
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-10 h-10 flex items-center justify-center rounded-xl
            bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10
            hover:bg-primary hover:text-white hover:border-primary
            disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        {getPageNums().map((n, i) =>
          n === "..." ? (
            <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onChange(n as number)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold text-sm transition-all
                ${page === n
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:border-primary/30"
                }`}
            >
              {n}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="w-10 h-10 flex items-center justify-center rounded-xl
            bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10
            hover:bg-primary hover:text-white hover:border-primary
            disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StokObatPage() {
  const [data, setData] = useState<ObatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stokFilter, setStokFilter] = useState<StokFilter>("all");
  const [page, setPage] = useState(1);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ObatRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<ObatRow | null>(null);

  // Forms
  const [addForm, setAddForm] = useState<typeof BLANK_FORM>(BLANK_FORM);
  const [editForm, setEditForm] = useState<typeof BLANK_FORM>(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const toastIdRef = useRef(0);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const undoCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((toast: Omit<ToastType, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.variant === "success") {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/apoteker/stok");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch stok:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.nama_obat.toLowerCase().includes(q));
    }
    if (stokFilter !== "all") {
      r = r.filter((x) => getStokStatus(x.stok, x.stok_minimum) === stokFilter);
    }
    return r;
  }, [data, search, stokFilter]);

  useEffect(() => setPage(1), [search, stokFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ─── Add Obat ────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.nama_obat || !addForm.stok || !addForm.harga) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/apoteker/stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_obat: addForm.nama_obat,
          stok: parseInt(addForm.stok),
          harga: parseInt(addForm.harga),
          satuan: addForm.satuan || "Tablet",
          stok_minimum: parseInt(addForm.stok_minimum) || 10,
        }),
      });
      if (res.ok) {
        setAddOpen(false);
        setAddForm(BLANK_FORM);
        await fetchData();
        addToast({ variant: "success", title: "Berhasil!", message: "Obat berhasil ditambahkan ke inventaris." });
      } else {
        const err = await res.json();
        addToast({ variant: "success", title: "Gagal", message: err.error || "Gagal menambahkan obat." });
      }
    } catch {
      addToast({ variant: "success", title: "Error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Edit Obat ───────────────────────────────────────────────────────────
  function openEdit(item: ObatRow) {
    setEditForm({
      nama_obat: item.nama_obat,
      stok: String(item.stok),
      harga: String(item.harga),
      satuan: item.satuan || "Tablet",
      stok_minimum: String(item.stok_minimum),
    });
    setEditItem(item);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/apoteker/stok", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_obat: editItem.id_obat,
          nama_obat: editForm.nama_obat,
          stok: parseInt(editForm.stok),
          harga: parseInt(editForm.harga),
          satuan: editForm.satuan || "Tablet",
          stok_minimum: parseInt(editForm.stok_minimum) || 10,
        }),
      });
      if (res.ok) {
        setEditItem(null);
        await fetchData();
        addToast({ variant: "success", title: "Berhasil!", message: "Data obat berhasil diperbarui." });
      } else {
        const err = await res.json();
        addToast({ variant: "success", title: "Gagal", message: err.error || "Gagal memperbarui obat." });
      }
    } catch {
      addToast({ variant: "success", title: "Error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Delete + Undo ───────────────────────────────────────────────────────
  function confirmDelete(item: ObatRow) {
    setDeleteItem(item);
  }

  function executeDelete(item: ObatRow) {
    setDeleteItem(null);

    // Optimistically remove from UI
    setData((prev) => prev.filter((x) => x.id_obat !== item.id_obat));

    let countdown = 5;
    const toastId = addToast({
      variant: "undo",
      title: "Obat Dihapus",
      message: `"${item.nama_obat}" telah dihapus dari inventaris.`,
      countdown,
      undoAction: () => handleUndo(item, toastId),
    });

    // Countdown interval
    undoCountdownRef.current = setInterval(() => {
      countdown -= 1;
      setToasts((prev) =>
        prev.map((t) => (t.id === toastId ? { ...t, countdown } : t))
      );
    }, 1000);

    // Auto-dismiss after 5s (delete is permanent in UI)
    undoTimerRef.current = setTimeout(() => {
      clearInterval(undoCountdownRef.current!);
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5500);

    function handleUndo(restoredItem: ObatRow, tid: number) {
      clearTimeout(undoTimerRef.current!);
      clearInterval(undoCountdownRef.current!);
      setToasts((prev) => prev.filter((t) => t.id !== tid));

      // Restore item to data (re-sort by nama_obat)
      setData((prev) => {
        const updated = [...prev, restoredItem];
        return updated.sort((a, b) => a.nama_obat.localeCompare(b.nama_obat, "id"));
      });

      addToast({
        variant: "success",
        title: "Berhasil",
        message: "Penghapusan dibatalkan. Data obat dipulihkan.",
      });
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  const criticalCount = data.filter((x) => getStokStatus(x.stok, x.stok_minimum) === "kritis").length;
  const habisCount = data.filter((x) => x.stok === 0).length;

  return (
    <>
      <style>{`
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
      `}</style>

      <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Manajemen Stok Obat
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Kelola ketersediaan obat dan inventaris apotek secara real-time.
            </p>
          </div>
          <button
            onClick={() => { setAddForm(BLANK_FORM); setAddOpen(true); }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-700
              text-white px-6 py-3 rounded-xl font-semibold transition-all
              shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 group w-full sm:w-auto"
          >
            <span>Tambah Obat</span>
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </header>

        {/* ─── Alert Banners ──────────────────────────────────────────────── */}
        {(criticalCount > 0 || habisCount > 0) && (
          <div className="flex flex-wrap gap-3">
            {habisCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-sm">
                <Package size={16} className="text-slate-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white">{habisCount}</span> obat stok habis
                </span>
              </div>
            )}
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-sm">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-red-700 dark:text-red-300">
                  <span className="font-bold">{criticalCount}</span> obat stok kritis
                </span>
              </div>
            )}
          </div>
        )}

        {/* ─── Toolbar ────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-7 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 rounded-full
                bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10
                text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Cari nama obat atau satuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="lg:col-span-5">
            <select
              className="w-full px-4 py-3 rounded-xl
                bg-white/80 dark:bg-[#1a1f36] border border-slate-200 dark:border-white/10
                text-slate-700 dark:text-white cursor-pointer appearance-none
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              value={stokFilter}
              onChange={(e) => setStokFilter(e.target.value as StokFilter)}
            >
              <option value="all">Ketersediaan (Semua)</option>
              <option value="aman">Stok Aman</option>
              <option value="kritis">Stok Kritis</option>
              <option value="habis">Habis</option>
            </select>
          </div>
        </section>

        {/* ─── Table ──────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center
            bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            <Package size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Tidak ada data obat</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {search || stokFilter !== "all" ? "Coba ubah filter pencarian" : "Tambahkan obat baru untuk memulai"}
            </p>
          </div>
        ) : (
          <>
            <section className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md
              border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300
                      border-b border-slate-200 dark:border-white/10">
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Nama Obat</th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Satuan</th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">
                        Stok Saat Ini
                      </th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">
                        Stok Min.
                      </th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Harga</th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">
                        Status
                      </th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {paginated.map((item) => {
                      const status = getStokStatus(item.stok, item.stok_minimum);
                      const isCritical = status === "kritis" || status === "habis";
                      return (
                        <tr
                          key={item.id_obat}
                          className={`transition-colors group
                            ${isCritical
                              ? "bg-red-50/60 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                        >
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                            {item.nama_obat}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                            {item.satuan || "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isCritical ? (
                              <span className="font-bold text-red-500 text-lg">{item.stok}</span>
                            ) : (
                              <span className="font-bold text-slate-700 dark:text-white">{item.stok}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                            {item.stok_minimum}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                            {formatRupiah(item.harga)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <StokBadge status={status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-2 rounded-lg transition-colors
                                  text-slate-400 hover:text-primary hover:bg-primary/10
                                  dark:text-slate-500 dark:hover:text-primary dark:hover:bg-primary/10"
                                title="Edit obat"
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                onClick={() => confirmDelete(item)}
                                className="p-2 rounded-lg transition-colors
                                  text-slate-400 hover:text-red-500 hover:bg-red-500/10
                                  dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                                title="Hapus obat"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ─── Pagination ─────────────────────────────────────────────── */}
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </>
        )}
      </div>

      {/* ─── Add Modal ──────────────────────────────────────────────────── */}
      {addOpen && (
        <ModalOverlay title="Tambah Obat Baru" onClose={() => setAddOpen(false)}>
          <ObatForm
            form={addForm}
            onChange={setAddForm}
            onSubmit={handleAdd}
            submitting={submitting}
            submitLabel="Simpan Obat"
          />
        </ModalOverlay>
      )}

      {/* ─── Edit Modal ─────────────────────────────────────────────────── */}
      {editItem && (
        <ModalOverlay title={`Edit Obat — ${editItem.nama_obat}`} onClose={() => setEditItem(null)}>
          <ObatForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            submitting={submitting}
            submitLabel="Simpan Perubahan"
          />
        </ModalOverlay>
      )}

      {/* ─── Delete Confirm Modal ───────────────────────────────────────── */}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onConfirm={() => executeDelete(deleteItem)}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {/* ─── Toasts ─────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
