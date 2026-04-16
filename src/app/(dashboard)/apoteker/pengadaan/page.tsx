"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  FileText,
  CheckCircle2,
  PackageCheck,
  Send,
  X,
  ShoppingCart,
  Eye,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PurchaseRequest {
  id_request: number;
  id_obat: number;
  jumlah_diminta: number;
  status: "pending" | "approved" | "ordered" | "received";
  created_at: string;
  catatan: string | null;
  obat: { nama_obat: string } | null;
}

interface ObatRow {
  id_obat: number;
  nama_obat: string;
  stok: number;
  harga: number;
  satuan: string | null;
}

type ToastItem = {
  id: number;
  variant: "success" | "error";
  title: string;
  message: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Menunggu", cls: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" },
  approved: { label: "Diproses", cls: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" },
  ordered:  { label: "Dikirim",  cls: "bg-primary/10 text-primary dark:text-blue-400 border border-primary/20" },
  received: { label: "Diterima", cls: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" },
};

const NEXT_ACTION: Record<string, { label: string; nextStatus: string }> = {
  pending:  { label: "Konfirmasi Pengadaan", nextStatus: "approved" },
  approved: { label: "Kirim PO",             nextStatus: "ordered"  },
  ordered:  { label: "Tandai Diterima",       nextStatus: "received" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getPONumber(req: PurchaseRequest) {
  const d = new Date(req.created_at);
  return `PO-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(req.id_request).padStart(3, "0")}`;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-56 rounded-xl bg-slate-200 dark:bg-white/10 mb-2" />
          <div className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="h-12 w-40 rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-11 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-white/80 dark:bg-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-6 w-24 rounded bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
          <div className="flex justify-between">
            <div className="h-8 w-32 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-10 w-44 rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return createPortal(
    <div className="fixed bottom-8 right-4 sm:right-8 z-[100] space-y-3 pointer-events-none">
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl
            backdrop-blur-md border max-w-sm w-full
            ${t.variant === "success"
              ? "bg-emerald-50/90 dark:bg-[rgba(16,185,129,0.15)] border-emerald-300 dark:border-emerald-500/30"
              : "bg-red-50/90 dark:bg-[rgba(239,68,68,0.15)] border-red-300 dark:border-red-500/30"
            }`}
          style={{ animation: "fadeInScale 0.3s ease-out forwards" }}
        >
          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
            ${t.variant === "success" ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-red-100 dark:bg-red-500/20"}`}>
            {t.variant === "success"
              ? <CheckCircle2 size={18} className="text-emerald-500" />
              : <AlertTriangle size={18} className="text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white text-sm">{t.title}</p>
            <p className="text-slate-500 dark:text-slate-300 text-xs truncate">{t.message}</p>
          </div>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

// ─── Create PO Modal ──────────────────────────────────────────────────────────
function CreateModal({
  obatList,
  onClose,
  onSuccess,
}: {
  obatList: ObatRow[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ id_obat: "", jumlah_diminta: "", catatan: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id_obat || !form.jumlah_diminta) { setError("Pilih obat dan isi jumlah."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/apoteker/pengadaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_obat: parseInt(form.id_obat),
          jumlah_diminta: parseInt(form.jumlah_diminta),
          catatan: form.catatan || null,
        }),
      });
      if (res.ok) { onSuccess(); onClose(); }
      else { const err = await res.json(); setError(err.error || "Gagal membuat permintaan."); }
    } catch { setError("Terjadi kesalahan jaringan."); }
    finally { setSubmitting(false); }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden
          bg-white dark:bg-[#1a1f36] border border-slate-200/80 dark:border-white/20"
        style={{ animation: "fadeInScale 0.2s ease-out forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Buat Permintaan Pengadaan</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Pilih Obat */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
              Pilih Obat <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
                bg-white dark:bg-[#1a1f36] text-slate-800 dark:text-white cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              value={form.id_obat}
              onChange={(e) => setForm({ ...form, id_obat: e.target.value })}
              required
            >
              <option value="">-- Pilih obat --</option>
              {obatList.map((o) => (
                <option key={o.id_obat} value={String(o.id_obat)}>
                  {o.nama_obat} (stok: {o.stok} {o.satuan || "unit"})
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
              Jumlah Diminta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
                bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="100"
              value={form.jumlah_diminta}
              onChange={(e) => setForm({ ...form, jumlah_diminta: e.target.value })}
              required
            />
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 dark:text-slate-300 ml-1">
              Catatan <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10
                bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              placeholder="Alasan pengadaan, prioritas, dll..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300
                bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold
                bg-primary hover:bg-blue-700 text-white transition-all
                shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Send size={16} />
              {submitting ? "Mengirim..." : "Simpan & Kirim PO"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ─── Detail Modal (Riwayat) ───────────────────────────────────────────────────
function DetailModal({
  req,
  obatMap,
  onClose,
}: {
  req: PurchaseRequest;
  obatMap: Map<number, ObatRow>;
  onClose: () => void;
}) {
  const obat = obatMap.get(req.id_obat);
  const total = obat ? req.jumlah_diminta * obat.harga : 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden
          bg-white dark:bg-[#1a1f36] border border-slate-200/80 dark:border-white/20"
        style={{ animation: "fadeInScale 0.2s ease-out forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{getPONumber(req)}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Detail Purchase Order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Status</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_MAP[req.status]?.cls}`}>
                {STATUS_MAP[req.status]?.label}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Tanggal</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-white">{formatDate(req.created_at)}</p>
            </div>
          </div>

          {/* Item detail */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">Detail Obat</p>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Nama Obat</span>
                <span className="font-semibold text-slate-800 dark:text-white text-sm">{req.obat?.nama_obat ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Jumlah Diminta</span>
                <span className="font-semibold text-slate-800 dark:text-white text-sm">
                  {req.jumlah_diminta} {obat?.satuan || "unit"}
                </span>
              </div>
              {obat && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Est. Harga Satuan</span>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{formatRupiah(obat.harga)}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Estimasi</span>
                    <span className="font-bold text-primary">{formatRupiah(total)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Catatan */}
          {req.catatan && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-1">Catatan</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">{req.catatan}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold
              transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── PO Active Card ───────────────────────────────────────────────────────────
function ActiveCard({
  req,
  obatMap,
  onAdvance,
  advancing,
}: {
  req: PurchaseRequest;
  obatMap: Map<number, ObatRow>;
  onAdvance: (id: number, status: string) => void;
  advancing: number | null;
}) {
  const obat = obatMap.get(req.id_obat);
  const total = obat ? req.jumlah_diminta * obat.harga : 0;
  const action = NEXT_ACTION[req.status];
  const status = STATUS_MAP[req.status];

  return (
    <article className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md
      border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6
      hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10 dark:bg-primary/10">
            <FileText size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 dark:text-white text-base">{getPONumber(req)}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status?.cls}`}>{status?.label}</span>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Dibuat pada {formatDate(req.created_at)}</p>
          </div>
        </div>
        {obat && (
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block">TOTAL ESTIMASI</span>
            {formatRupiah(total)}
          </p>
        )}
      </div>

      {/* Item Table */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="text-left px-4 py-3 text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Nama Obat</th>
              <th className="text-center px-4 py-3 text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Jumlah</th>
              <th className="text-right px-4 py-3 text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 hidden sm:table-cell">Est. Harga Satuan</th>
              <th className="text-right px-4 py-3 text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{req.obat?.nama_obat ?? "—"}</td>
              <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                {req.jumlah_diminta} {obat?.satuan || "unit"}
              </td>
              <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                {obat ? formatRupiah(obat.harga) : "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">
                {obat ? formatRupiah(total) : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Catatan */}
      {req.catatan && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4 px-1">
          Catatan: {req.catatan}
        </p>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Total Estimasi</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-white">{obat ? formatRupiah(total) : "—"}</p>
        </div>
        {action && (
          <button
            onClick={() => onAdvance(req.id_request, action.nextStatus)}
            disabled={advancing === req.id_request}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
              bg-primary hover:bg-blue-700 text-white transition-all
              shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95
              disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {action.nextStatus === "approved" && <CheckCircle2 size={16} />}
            {action.nextStatus === "ordered"  && <Send size={16} />}
            {action.nextStatus === "received" && <PackageCheck size={16} />}
            {advancing === req.id_request ? "Memproses..." : action.label}
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Riwayat Row ──────────────────────────────────────────────────────────────
function RiwayatRow({
  req,
  obatMap,
  onDetail,
}: {
  req: PurchaseRequest;
  obatMap: Map<number, ObatRow>;
  onDetail: (req: PurchaseRequest) => void;
}) {
  const obat = obatMap.get(req.id_obat);
  const total = obat ? req.jumlah_diminta * obat.harga : 0;

  return (
    <article className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md
      border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-5
      hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-150">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
          <CheckCircle2 size={20} className="text-emerald-500" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-white text-sm">{getPONumber(req)}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_MAP.received.cls}`}>Diterima</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {req.obat?.nama_obat ?? "—"} · {formatDate(req.created_at)}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold">Total</p>
            <p className="font-bold text-slate-800 dark:text-white text-sm">{obat ? formatRupiah(total) : "—"}</p>
          </div>
          <button
            onClick={() => onDetail(req)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
              bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300
              hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary
              border border-slate-200 dark:border-white/10 transition-all"
          >
            <Eye size={15} />
            <span className="hidden sm:inline">Detail</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PengadaanPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [obatMap, setObatMap]   = useState<Map<number, ObatRow>>(new Map());
  const [obatList, setObatList] = useState<ObatRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailReq, setDetailReq] = useState<PurchaseRequest | null>(null);
  const [advancing, setAdvancing] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [reqs, obat] = await Promise.all([
        fetch("/api/apoteker/pengadaan").then((r) => r.json()),
        fetch("/api/apoteker/stok").then((r) => r.json()),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      const list: ObatRow[] = Array.isArray(obat) ? obat : [];
      setObatList(list);
      setObatMap(new Map(list.map((o) => [o.id_obat, o])));
    } catch (err) {
      console.error("Failed to fetch pengadaan:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeRequests  = requests.filter((r) => r.status !== "received");
  const historyRequests = requests.filter((r) => r.status === "received");

  async function handleAdvance(id_request: number, status: string) {
    setAdvancing(id_request);
    try {
      const res = await fetch("/api/apoteker/pengadaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_request, status }),
      });
      if (res.ok) {
        const label = STATUS_MAP[status]?.label ?? status;
        addToast({ variant: "success", title: "Status Diperbarui", message: `Permintaan berhasil diubah ke "${label}".` });
        if (status === "received") {
          addToast({ variant: "success", title: "Stok Diperbarui", message: "Stok obat otomatis bertambah." });
        }
        await fetchAll();
      } else {
        const err = await res.json();
        addToast({ variant: "error", title: "Gagal", message: err.error || "Gagal memperbarui status." });
      }
    } catch {
      addToast({ variant: "error", title: "Error", message: "Terjadi kesalahan jaringan." });
    } finally {
      setAdvancing(null);
    }
  }

  function handleCreateSuccess() {
    addToast({ variant: "success", title: "Berhasil!", message: "Purchase Order telah berhasil dikirim ke supplier." });
    fetchAll();
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <>
      <style>{`@keyframes fadeInScale{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>

      <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Pengadaan Obat
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Kelola dan pantau pesanan pembelian obat apotek Anda.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-700
              text-white px-6 py-3 rounded-xl font-semibold transition-all w-full sm:w-auto
              shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 group"
          >
            <span>Buat Permintaan</span>
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
          </button>
        </header>

        {/* ─── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {[
            { key: "active",  label: "PO Aktif",    count: activeRequests.length  },
            { key: "history", label: "Riwayat PO",  count: historyRequests.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "active" | "history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all
                ${activeTab === tab.key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary dark:bg-primary/20"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── PO Aktif Tab ───────────────────────────────────────────────── */}
        {activeTab === "active" && (
          <section className="space-y-4">
            {activeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center
                bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <ShoppingCart size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Tidak ada PO aktif</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Buat permintaan pengadaan baru untuk mulai.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Purchase Order Aktif
                  </h2>
                </div>
                {activeRequests.map((req) => (
                  <ActiveCard
                    key={req.id_request}
                    req={req}
                    obatMap={obatMap}
                    onAdvance={handleAdvance}
                    advancing={advancing}
                  />
                ))}
              </>
            )}
          </section>
        )}

        {/* ─── Riwayat PO Tab ─────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <section className="space-y-3">
            {historyRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center
                bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <CheckCircle2 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Belum ada riwayat PO</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">PO yang sudah diterima akan muncul di sini.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Riwayat Purchase Order
                  </h2>
                </div>
                {historyRequests.map((req) => (
                  <RiwayatRow
                    key={req.id_request}
                    req={req}
                    obatMap={obatMap}
                    onDetail={setDetailReq}
                  />
                ))}
              </>
            )}
          </section>
        )}
      </div>

      {/* ─── Modals ─────────────────────────────────────────────────────── */}
      {createOpen && (
        <CreateModal
          obatList={obatList}
          onClose={() => setCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {detailReq && (
        <DetailModal
          req={detailReq}
          obatMap={obatMap}
          onClose={() => setDetailReq(null)}
        />
      )}

      {/* ─── Toasts ─────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
