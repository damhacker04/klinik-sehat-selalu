"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Wallet,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Info,
  Printer,
  Receipt,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RincianTransaksi = { keterangan: string; biaya: number };
type RekamMedis = {
  tanggal_periksa: string;
  dokter: { nama: string } | null;
} | null;

type Transaksi = {
  id_transaksi: number;
  total_biaya: number;
  status: "draft" | "paid";
  metode_pembayaran: string | null;
  tanggal_bayar: string | null;
  rincian_transaksi: RincianTransaksi[];
  rekam_medis: RekamMedis | RekamMedis[];
};

type Tab = "belum_bayar" | "lunas";
type MetodeBayar = "transfer" | "kartu";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const fmtInvNo = (id: number, tgl: string | null | undefined) => {
  const d = tgl ? new Date(tgl) : new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${ym}-${String(id).padStart(2, "0")}`;
};

const getRekamMedis = (t: Transaksi): RekamMedis => {
  if (!t.rekam_medis) return null;
  return Array.isArray(t.rekam_medis) ? t.rekam_medis[0] ?? null : t.rekam_medis;
};

const getKeterangan = (t: Transaksi): string => {
  if (t.rincian_transaksi?.length) return t.rincian_transaksi[0].keterangan;
  return "Layanan Kesehatan";
};

// ─── Constants ────────────────────────────────────────────────────────────────
const GLASS =
  "bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.07] shadow-sm";
const GLASS_INTENSE =
  "bg-primary/5 dark:bg-primary/10 backdrop-blur-xl border border-primary/20 dark:border-primary/25";
const CARD_HOVER =
  "hover:border-primary/40 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300";

// ─── Component ────────────────────────────────────────────────────────────────
export default function PasienTagihanPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("belum_bayar");

  // Payment flow
  const [payDialog, setPayDialog] = useState<{ ids: number[]; total: number } | null>(null);
  const [metode, setMetode] = useState<MetodeBayar>("transfer");
  const [processing, setProcessing] = useState(false);
  const [payResult, setPayResult] = useState<{ success: boolean; message: string } | null>(null);

  // Detail dialog
  const [detailItem, setDetailItem] = useState<Transaksi | null>(null);

  // ── Fetch ──
  const fetchData = async () => {
    try {
      const res = await fetch("/api/pasien/tagihan");
      if (res.ok) {
        const result = await res.json();
        setData(Array.isArray(result) ? result : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Derived ──
  const belumBayar = data.filter((t) => t.status === "draft");
  const lunas = data.filter((t) => t.status === "paid");
  const totalBelumBayar = belumBayar.reduce((sum, t) => sum + (t.total_biaya || 0), 0);
  const totalLunas = lunas.reduce((sum, t) => sum + (t.total_biaya || 0), 0);

  // ── Handlers ──
  const handleBayarSemua = () => {
    if (!belumBayar.length) return;
    setMetode("transfer");
    setPayDialog({ ids: belumBayar.map((t) => t.id_transaksi), total: totalBelumBayar });
  };

  const handleBayarSatu = (t: Transaksi) => {
    setMetode("transfer");
    setPayDialog({ ids: [t.id_transaksi], total: t.total_biaya });
  };

  const handleConfirmPay = async () => {
    if (!payDialog) return;
    setProcessing(true);
    try {
      let allSuccess = true;
      for (const id of payDialog.ids) {
        const res = await fetch("/api/pasien/tagihan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_transaksi: id, metode_pembayaran: metode }),
        });
        if (!res.ok) { allSuccess = false; break; }
      }
      setPayDialog(null);
      setPayResult({
        success: allSuccess,
        message: allSuccess
          ? `Pembayaran dengan ${metode === "transfer" ? "Transfer Bank" : "Kartu Kredit"} berhasil diselesaikan!`
          : "Sebagian atau seluruh pembayaran gagal. Silakan coba lagi.",
      });
      if (allSuccess) {
        fetchData();
        setActiveTab("lunas");
      }
    } catch {
      setPayDialog(null);
      setPayResult({ success: false, message: "Terjadi kesalahan jaringan. Silakan coba lagi." });
    } finally {
      setProcessing(false);
    }
  };

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-slate-800/60" />
          <div className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-slate-800/60" />
        </div>
        <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
        <div className="h-10 w-56 rounded-full bg-slate-200 dark:bg-slate-800/60" />
        <div className="grid grid-cols-2 gap-5">
          <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
          <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Tagihan Saya
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola dan tinjau riwayat pembayaran layanan kesehatan Anda.
        </p>
      </div>

      {/* ── Hero Banner: Belum Bayar ── */}
      {activeTab === "belum_bayar" && (
        <section className="relative group">
          {/* glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-3xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
          <div
            className={`${GLASS_INTENSE} relative rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6`}
          >
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-widest uppercase">
                Total Tagihan Belum Dibayar
              </p>
              <p className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                <span className="text-primary mr-2">Rp</span>
                {totalBelumBayar.toLocaleString("id-ID")}
              </p>
            </div>
            {belumBayar.length > 0 ? (
              <button
                onClick={handleBayarSemua}
                className="flex-shrink-0 flex items-center gap-3 bg-primary hover:bg-blue-600 text-white px-7 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
              >
                <CreditCard className="w-5 h-5" />
                Bayar Semua Tagihan Sekarang
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle className="w-6 h-6" />
                <span>Semua tagihan lunas!</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Summary Cards: Lunas ── */}
      {activeTab === "lunas" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${GLASS} rounded-2xl p-6 space-y-1.5`}>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Total Pembayaran Berhasil
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {formatRp(totalLunas)}
            </p>
          </div>
          <div className={`${GLASS} rounded-2xl p-6 space-y-1.5`}>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Transaksi Selesai
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lunas.length} Transaksi
            </p>
          </div>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
        {(["belum_bayar", "lunas"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 pt-2 text-sm font-bold tracking-wide transition-all border-b-2 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {tab === "belum_bayar"
              ? `Belum Bayar${belumBayar.length > 0 ? ` (${belumBayar.length})` : ""}`
              : "Lunas"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: Belum Bayar
      ══════════════════════════════════════════ */}
      {activeTab === "belum_bayar" && (
        <>
          {belumBayar.length === 0 ? (
            <div
              className={`${GLASS} rounded-2xl p-14 flex flex-col items-center justify-center gap-4 text-center`}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">
                  Semua Tagihan Lunas!
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Tidak ada tagihan yang perlu dibayar saat ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {belumBayar.map((t) => {
                const rm = getRekamMedis(t);
                return (
                  <article
                    key={t.id_transaksi}
                    className={`${GLASS} ${CARD_HOVER} rounded-2xl p-6 flex flex-col justify-between cursor-default`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="space-y-1 min-w-0 pr-3">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-wider">
                          {fmtInvNo(t.id_transaksi, rm?.tanggal_periksa)}
                        </p>
                        <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug truncate">
                          {getKeterangan(t)}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {fmtDate(rm?.tanggal_periksa)}
                          {rm?.dokter?.nama ? ` • ${rm.dokter.nama}` : ""}
                        </p>
                      </div>
                      <span className="flex-shrink-0 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 whitespace-nowrap">
                        Belum Bayar
                      </span>
                    </div>

                    {/* Rincian toggle */}
                    {t.rincian_transaksi?.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {t.rincian_transaksi.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="truncate pr-2">{r.keterangan}</span>
                            <span className="flex-shrink-0 font-medium">{formatRp(r.biaya)}</span>
                          </div>
                        ))}
                        {t.rincian_transaksi.length > 3 && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                            +{t.rincian_transaksi.length - 3} item lainnya
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-white/5">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-xs block mb-0.5">
                          Total Tagihan
                        </span>
                        <span className="text-slate-900 dark:text-white text-2xl font-bold">
                          {formatRp(t.total_biaya)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBayarSatu(t)}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        Bayar Sekarang
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          TAB: Lunas
      ══════════════════════════════════════════ */}
      {activeTab === "lunas" && (
        <>
          {lunas.length === 0 ? (
            <div
              className={`${GLASS} rounded-2xl p-14 flex flex-col items-center justify-center gap-4 text-center`}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Belum Ada Riwayat Pembayaran
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Transaksi yang telah lunas akan muncul di sini.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lunas.map((t) => {
                const rm = getRekamMedis(t);
                return (
                  <div
                    key={t.id_transaksi}
                    className={`${GLASS} ${CARD_HOVER} rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                  >
                    {/* Left: info */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                          {fmtDate(t.tanggal_bayar)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Lunas
                        </span>
                        {t.metode_pembayaran && (
                          <span className="text-slate-400 dark:text-slate-500 text-xs capitalize">
                            • {t.metode_pembayaran === "transfer" ? "Transfer Bank" : "Kartu Kredit"}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                        {fmtInvNo(t.id_transaksi, t.tanggal_bayar)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm truncate">
                        {getKeterangan(t)}
                        {rm?.dokter?.nama ? ` • ${rm.dokter.nama}` : ""}
                      </p>
                    </div>

                    {/* Right: total + action */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                      <div className="flex flex-col sm:items-end">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                          Total
                        </p>
                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                          {formatRp(t.total_biaya)}
                        </p>
                      </div>
                      <button
                        onClick={() => setDetailItem(t)}
                        className="flex items-center justify-center gap-2 rounded-xl h-10 px-4 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white transition-all duration-200 text-sm font-semibold group"
                      >
                        <Receipt className="w-4 h-4" />
                        <span className="hidden sm:inline">Kuitansi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {lunas.length > 0 && (
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs pt-1">
              Menampilkan {lunas.length} transaksi terakhir.
            </p>
          )}
        </>
      )}

      {/* ── Footer ── */}
      <footer className="text-center pt-4 pb-2">
        <p className="text-slate-500 dark:text-slate-500 text-sm flex items-center justify-center gap-1.5">
          <Info className="w-4 h-4 flex-shrink-0" />
          Butuh bantuan terkait tagihan?{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Hubungi Admin Klinik
          </a>
        </p>
      </footer>

      {/* ════════════════════════════════════════════
          DIALOG: Pembayaran
      ════════════════════════════════════════════ */}
      {payDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !processing) setPayDialog(null); }}
        >
          <div
            className={`${GLASS} rounded-3xl p-8 w-full max-w-md space-y-6 animate-in zoom-in-95 duration-200`}
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <CreditCard className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Konfirmasi Pembayaran
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pilih metode untuk menyelesaikan tagihan.
              </p>
            </div>

            {/* Amount */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                Total Tagihan
              </p>
              <p className="text-4xl font-extrabold text-primary">
                {formatRp(payDialog.total)}
              </p>
              {payDialog.ids.length > 1 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {payDialog.ids.length} tagihan sekaligus
                </p>
              )}
            </div>

            {/* Metode */}
            <div className="grid grid-cols-2 gap-3">
              {(["transfer", "kartu"] as MetodeBayar[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetode(m)}
                  className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all duration-200 font-semibold text-sm ${
                    metode === m
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/15"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40 bg-white/50 dark:bg-slate-800/30"
                  }`}
                >
                  {m === "transfer" ? <Wallet className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                  {m === "transfer" ? "Transfer Bank" : "Kartu Kredit"}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPayDialog(null)}
                disabled={processing}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-3 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPay}
                disabled={processing}
                className="flex-1 rounded-2xl bg-primary hover:bg-blue-600 text-white py-3 font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {processing && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Ya, Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          DIALOG: Hasil Pembayaran
      ════════════════════════════════════════════ */}
      {payResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`${GLASS} rounded-3xl p-10 w-full max-w-sm text-center space-y-5 animate-in zoom-in-95 duration-200`}
          >
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                payResult.success ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}
            >
              {payResult.success ? (
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {payResult.success ? "Pembayaran Berhasil!" : "Pembayaran Gagal"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {payResult.message}
              </p>
            </div>
            <button
              onClick={() => setPayResult(null)}
              className="w-full rounded-2xl bg-primary hover:bg-blue-600 text-white py-3 font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          DIALOG: Detail Kuitansi
      ════════════════════════════════════════════ */}
      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailItem(null); }}
        >
          <div
            className={`${GLASS} rounded-3xl p-8 w-full max-w-md space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                  {fmtInvNo(detailItem.id_transaksi, detailItem.tanggal_bayar)}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Detail Kuitansi
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Lunas
              </span>
            </div>

            {/* Meta info */}
            <div className="bg-slate-50 dark:bg-white/[0.04] rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Bayar</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {fmtDate(detailItem.tanggal_bayar)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Metode</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {detailItem.metode_pembayaran === "transfer" ? "Transfer Bank" : detailItem.metode_pembayaran === "kartu" ? "Kartu Kredit" : detailItem.metode_pembayaran ?? "-"}
                </span>
              </div>
              {(() => {
                const rm = getRekamMedis(detailItem);
                return rm?.dokter?.nama ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Dokter</span>
                    <span className="font-medium text-slate-900 dark:text-white">{rm.dokter.nama}</span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Rincian */}
            {detailItem.rincian_transaksi?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rincian Layanan
                </p>
                <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                  {detailItem.rincian_transaksi.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 truncate pr-2">{r.keterangan}</span>
                      <span className="font-medium text-slate-900 dark:text-white flex-shrink-0">{formatRp(r.biaya)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-white/5 font-bold text-sm">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-primary">{formatRp(detailItem.total_biaya)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDetailItem(null)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-3 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-2xl bg-primary hover:bg-blue-600 text-white py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Cetak / Unduh
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
