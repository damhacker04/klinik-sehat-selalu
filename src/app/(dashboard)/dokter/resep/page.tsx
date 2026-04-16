"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Send,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Pill,
  FileText,
  UserRound,
  Eye,
  ChevronDown,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RekamMedis {
  id_rekam: number;
  diagnosa: string | null;
  catatan: string | null;
  rujukan: string | null;
  tanggal_periksa: string;
  pasien: { nama: string } | null;
}

interface ObatItem {
  id_obat: number;
  nama_obat: string;
  satuan: string | null;
  stok: number;
}

interface ResepItem {
  id_obat: string;
  jumlah: number;
  dosis: string;
  catatan: string;
}

// ─── Toast Portal ──────────────────────────────────────────────────────────────

function SuccessToast({ onClose }: { onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed top-5 right-5 z-[9999] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="flex items-center gap-3 bg-emerald-500 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 min-w-[280px]">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">Berhasil!</p>
          <p className="text-xs text-emerald-100">Resep berhasil dikirim ke apotek.</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-emerald-400/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DokterResepPage() {
  const [rekamList, setRekamList] = useState<RekamMedis[]>([]);
  const [obatList, setObatList] = useState<ObatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRekamId, setSelectedRekamId] = useState("");
  const [items, setItems] = useState<ResepItem[]>([
    { id_obat: "", jumlah: 1, dosis: "", catatan: "" },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedRekam = useMemo(
    () => rekamList.find((r) => String(r.id_rekam) === selectedRekamId) ?? null,
    [rekamList, selectedRekamId]
  );

  const getObatById = useCallback(
    (id: string) => obatList.find((o) => String(o.id_obat) === id) ?? null,
    [obatList]
  );

  const validItems = items.filter((i) => i.id_obat && i.jumlah > 0);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchAll() {
    try {
      const [rekamRes, obatRes] = await Promise.all([
        fetch("/api/dokter/rekam-medis"),
        fetch("/api/apoteker/stok"),
      ]);
      if (rekamRes.ok) setRekamList(await rekamRes.json());
      if (obatRes.ok) setObatList(await obatRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Item Handlers ─────────────────────────────────────────────────────────

  function addItem() {
    setItems((prev) => [...prev, { id_obat: "", jumlah: 1, dosis: "", catatan: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof ResepItem, value: string | number) {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setErrorMsg("");
    if (!selectedRekamId) {
      setErrorMsg("Pilih pasien terlebih dahulu");
      return;
    }
    if (validItems.length === 0) {
      setErrorMsg("Tambahkan minimal 1 obat dengan data lengkap");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dokter/resep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rekam: parseInt(selectedRekamId),
          items: validItems.map((i) => ({
            id_obat: parseInt(i.id_obat),
            jumlah: i.jumlah,
            dosis: i.dosis
              ? i.catatan
                ? `${i.dosis} — ${i.catatan}`
                : i.dosis
              : i.catatan || null,
          })),
        }),
      });

      if (res.ok) {
        setShowPreview(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        // Reset form
        setSelectedRekamId("");
        setItems([{ id_obat: "", jumlah: 1, dosis: "", catatan: "" }]);
        // Refetch updated list
        const r = await fetch("/api/dokter/rekam-medis");
        if (r.ok) setRekamList(await r.json());
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Gagal membuat resep");
        setShowPreview(false);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
      setShowPreview(false);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 min-h-screen p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {showToast && <SuccessToast onClose={() => setShowToast(false)} />}

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-3">
          <Pill className="w-7 h-7 text-blue-500" />
          Resep &amp; Rujukan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Buat resep obat dan kelola surat rujukan pasien
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <section className="lg:col-span-1 space-y-6">
            {/* Patient Selection */}
            <div className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <UserRound className="w-5 h-5 text-blue-500" />
                Pilih Pasien
              </h2>

              {/* Dropdown */}
              <div className="relative mb-5">
                <select
                  value={selectedRekamId}
                  onChange={(e) => {
                    setSelectedRekamId(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih pasien --</option>
                  {rekamList.map((r) => (
                    <option key={r.id_rekam} value={String(r.id_rekam)}>
                      {r.pasien?.nama || "Pasien"} — RM
                      {String(r.id_rekam).padStart(5, "0")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Patient Summary */}
              {selectedRekam ? (
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/5 pb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        Nama Pasien
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {selectedRekam.pasien?.nama || "—"}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[10px] rounded-lg font-bold border border-blue-500/20 shrink-0 ml-2">
                      RAWAT JALAN
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
                      Diagnosis
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {selectedRekam.diagnosa || (
                        <span className="text-slate-400 italic">Belum ada diagnosis</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
                      Tanggal Periksa
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {new Date(selectedRekam.tanggal_periksa).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {selectedRekam.catatan && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
                        Catatan
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {selectedRekam.catatan}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-6 text-center">
                  <UserRound className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Pilih pasien dari daftar untuk melihat ringkasan
                  </p>
                </div>
              )}
            </div>

            {/* Rujukan Info */}
            <div className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Surat Rujukan
              </h2>
              {selectedRekam?.rujukan ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">
                      Tujuan Rujukan
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {selectedRekam.rujukan}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    Rujukan telah dicatat pada pemeriksaan
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-5 text-center">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {selectedRekam
                      ? "Tidak ada rujukan untuk pasien ini"
                      : "Pilih pasien untuk melihat informasi rujukan"}
                  </p>
                  {selectedRekam && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Rujukan dapat ditambahkan melalui halaman Pemeriksaan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Riwayat Resep mini */}
            <div className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  Pasien Siap Diberi Resep
                </h2>
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                  {rekamList.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rekamList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Tidak ada pasien menunggu resep
                  </p>
                ) : (
                  rekamList.map((r) => (
                    <button
                      key={r.id_rekam}
                      onClick={() => {
                        setSelectedRekamId(String(r.id_rekam));
                        setErrorMsg("");
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        selectedRekamId === String(r.id_rekam)
                          ? "bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400"
                          : "bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <p className="font-medium truncate">
                        {r.pasien?.nama || "Pasien"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {r.diagnosa || "Belum terdiagnosis"} • RM
                        {String(r.id_rekam).padStart(5, "0")}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ── Right Column ─────────────────────────────────────────────── */}
          <section className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Resep Obat
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedRekam?.diagnosa
                      ? `Diagnosis: ${selectedRekam.diagnosa}`
                      : "Pilih pasien untuk mulai menulis resep"}
                  </p>
                </div>
                {selectedRekam && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      No. Rekam Medis
                    </p>
                    <p className="text-sm font-mono font-bold text-blue-500">
                      RM-{String(selectedRekam.id_rekam).padStart(5, "0")}
                    </p>
                  </div>
                )}
              </div>

              {/* Medication List */}
              <div className="p-6 space-y-4 flex-grow">
                {!selectedRekam && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <Pill className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium">Belum ada pasien dipilih</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Pilih pasien dari panel kiri untuk mulai membuat resep
                    </p>
                  </div>
                )}

                {selectedRekam && (
                  <>
                    {items.map((item, idx) => {
                      const obat = getObatById(item.id_obat);
                      return (
                        <div
                          key={idx}
                          className="relative bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 border-l-4 border-l-blue-500 rounded-2xl p-5 transition-all duration-200 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Nama Obat */}
                            <div className="md:col-span-6">
                              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1.5 ml-1">
                                Nama Obat
                              </label>
                              <div className="relative">
                                <select
                                  value={item.id_obat}
                                  onChange={(e) =>
                                    updateItem(idx, "id_obat", e.target.value)
                                  }
                                  className="w-full appearance-none bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                >
                                  <option value="">Pilih obat...</option>
                                  {obatList.map((o) => (
                                    <option
                                      key={o.id_obat}
                                      value={String(o.id_obat)}
                                      disabled={o.stok <= 0}
                                    >
                                      {o.nama_obat}
                                      {o.satuan ? ` (${o.satuan})` : ""} — stok:{" "}
                                      {o.stok}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {obat && (
                                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                  Stok tersedia: {obat.stok} {obat.satuan || "unit"}
                                </p>
                              )}
                            </div>

                            {/* Jumlah */}
                            <div className="md:col-span-2">
                              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1.5 ml-1">
                                Jumlah
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={item.jumlah}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "jumlah",
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-center text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                              />
                            </div>

                            {/* Dosis */}
                            <div className="md:col-span-4">
                              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1.5 ml-1">
                                Dosis / Aturan Pakai
                              </label>
                              <input
                                type="text"
                                value={item.dosis}
                                onChange={(e) =>
                                  updateItem(idx, "dosis", e.target.value)
                                }
                                placeholder="mis: 3 × 1 tablet"
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                              />
                            </div>

                            {/* Catatan Tambahan */}
                            <div className="md:col-span-11">
                              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-1.5 ml-1">
                                Catatan Tambahan
                              </label>
                              <textarea
                                rows={1}
                                value={item.catatan}
                                onChange={(e) =>
                                  updateItem(idx, "catatan", e.target.value)
                                }
                                placeholder="mis: Diminum setelah makan, habiskan..."
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                              />
                            </div>

                            {/* Delete Button */}
                            <div className="md:col-span-1 flex items-end justify-center pb-0.5">
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                disabled={items.length <= 1}
                                className="p-2.5 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Hapus obat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add More Button */}
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 transition-all duration-200 py-4 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-medium">Tambah Obat Lagi</span>
                    </button>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 rounded-b-2xl space-y-3">
                <button
                  type="button"
                  disabled={!selectedRekam || validItems.length === 0}
                  onClick={() => {
                    setErrorMsg("");
                    setShowPreview(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  <Eye className="w-5 h-5" />
                  Pratinjau &amp; Kirim Resep ke Apotek
                </button>
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-[0.15em]">
                  Sistem Informasi Klinik • Tanda Tangan Digital Terverifikasi
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── Preview Modal ─────────────────────────────────────────────────── */}
      {showPreview && selectedRekam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreview(false);
          }}
        >
          <div className="bg-white dark:bg-[#1a2035] border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  Pratinjau Resep
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa kembali detail resep sebelum dikirim ke apotek
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Pasien
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold text-lg">
                    {selectedRekam.pasien?.nama}
                  </p>
                  <p className="text-slate-400 text-xs">
                    RM-{String(selectedRekam.id_rekam).padStart(5, "0")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Diagnosis
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">
                    {selectedRekam.diagnosa || "—"}
                  </p>
                </div>
              </div>

              <table className="w-full text-left mt-2">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    {["Obat", "Jumlah", "Dosis / Aturan", "Catatan"].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {validItems.map((item, idx) => {
                    const obat = getObatById(item.id_obat);
                    return (
                      <tr key={idx}>
                        <td className="py-3.5 pr-4">
                          <p className="text-slate-800 dark:text-white font-medium text-sm">
                            {obat?.nama_obat || "—"}
                          </p>
                          {obat?.satuan && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {obat.satuan}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-300 text-sm">
                          {item.jumlah}
                        </td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-300 text-sm">
                          {item.dosis || (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                          {item.catatan || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pt-4 border-t border-dashed border-slate-200 dark:border-white/10 flex justify-end">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    Tanda Tangan Digital
                  </p>
                  <p className="text-sm italic text-blue-500 mt-1 font-serif">
                    dr. — Klinik Sehat Selalu
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPreview(false)}
                disabled={submitting}
                className="flex-1 order-2 sm:order-1 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Konfirmasi &amp; Kirim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/80 dark:bg-white/3 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-12 w-full" />
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-20 mt-2" />
            <SkeletonBlock className="h-5 w-full" />
          </div>
        </div>
        <div className="bg-white/80 dark:bg-white/3 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white/80 dark:bg-white/3 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="h-4 w-48" />
            </div>
            <SkeletonBlock className="h-6 w-24 hidden sm:block" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-slate-100 dark:border-white/5 rounded-2xl p-5 space-y-3"
            >
              <div className="grid grid-cols-12 gap-4">
                <SkeletonBlock className="col-span-6 h-10" />
                <SkeletonBlock className="col-span-2 h-10" />
                <SkeletonBlock className="col-span-4 h-10" />
                <SkeletonBlock className="col-span-11 h-8" />
              </div>
            </div>
          ))}
          <SkeletonBlock className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200 dark:bg-white/5 rounded-xl ${className ?? ""}`}
    />
  );
}
