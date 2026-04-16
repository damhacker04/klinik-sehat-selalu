"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Stethoscope,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  HeartPulse,
  Thermometer,
  Weight,
  Ruler,
  ClipboardList,
  Activity,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AntrianItem {
  id_antrian: number;
  nomor_antrian: number;
  status: string;
  created_at: string;
  form_pendaftaran?: {
    id_pasien?: number | null;
    keluhan?: string | null;
    pasien?: { nama: string } | null;
  } | null;
}

// ─── Style constants ──────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-slate-200 dark:border-white/10";

const ACTIVE_CARD =
  "bg-primary/10 dark:bg-[rgba(19,55,236,0.15)] border border-primary shadow-lg shadow-primary/20 dark:shadow-[0_0_15px_rgba(19,55,236,0.4)]";

const INPUT_BASE =
  "w-full rounded-xl py-2.5 md:py-3 px-3 md:px-4 bg-slate-50 dark:bg-[rgba(255,255,255,0.03)] border text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors text-sm";

const INPUT_NORMAL = `${INPUT_BASE} border-slate-200 dark:border-white/10`;
const INPUT_ERROR = `${INPUT_BASE} border-red-400 dark:border-red-500/50 focus:ring-red-400/20 focus:border-red-400`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number) {
  return `A${String(n).padStart(3, "0")}`;
}

function validateVitals(
  systolic: string,
  diastolic: string,
  suhu: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!systolic || !diastolic) {
    errors.tekanan_darah = "Tekanan darah wajib diisi";
  } else {
    const s = parseInt(systolic);
    const d = parseInt(diastolic);
    if (isNaN(s) || isNaN(d) || s < 70 || s > 200 || d < 40 || d > 130 || s <= d) {
      errors.tekanan_darah = "Nilai di luar jangkauan normal";
    }
  }

  if (suhu) {
    const t = parseFloat(suhu);
    if (!isNaN(t)) {
      if (t < 35) errors.suhu = "Suhu tubuh terlalu rendah";
      else if (t > 42) errors.suhu = "Suhu tubuh terlalu tinggi";
    }
  }

  return errors;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 lg:gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="lg:col-span-8">
          <div className="min-h-[480px] md:min-h-[560px] bg-slate-200 dark:bg-slate-800 rounded-2xl md:rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Patient Queue Card ────────────────────────────────────────────────────────

function PatientCard({
  item,
  isActive,
  onClick,
}: {
  item: AntrianItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const nama = item.form_pendaftaran?.pasien?.nama ?? "Pasien";
  const keluhan = item.form_pendaftaran?.keluhan ?? "-";
  const isCalled = item.status === "called";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-200 relative overflow-hidden ${
        isActive
          ? ACTIVE_CARD
          : `${GLASS} hover:bg-slate-50 dark:hover:bg-white/10`
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${
              isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {fmtNum(item.nomor_antrian)}
          </p>
          <h3 className="text-base font-bold truncate text-slate-800 dark:text-white">
            {nama}
          </h3>
        </div>
        {isCalled ? (
          <span className="shrink-0 ml-2 bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-500/30 uppercase tracking-wide">
            Dipanggil
          </span>
        ) : (
          <span className="shrink-0 ml-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30 uppercase tracking-wide">
            Menunggu
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <ClipboardList className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{keluhan}</span>
      </div>
    </button>
  );
}

// ─── Form Empty / No Selection State ─────────────────────────────────────────

function FormEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] md:min-h-[400px] gap-4 text-center px-6 py-8">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 dark:bg-primary/5 flex items-center justify-center">
        <Activity className="w-8 h-8 md:w-10 md:h-10 text-primary opacity-60" />
      </div>
      <div>
        <h3 className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
          Pilih Pasien untuk Memulai
        </h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 max-w-xs leading-relaxed">
          Klik salah satu pasien dari daftar untuk mengisi data vital signs.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PemeriksaanPage() {
  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<AntrianItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields (manual state — avoids RHF complexity with split tekanan darah)
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [suhu, setSuhu] = useState("");
  const [detakJantung, setDetakJantung] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [catatan, setCatatan] = useState("");

  // UI states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showGlobalError, setShowGlobalError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ── Fetch antrian ──
  const fetchAntrian = useCallback(async () => {
    try {
      const res = await fetch("/api/perawat/antrian");
      if (res.ok) {
        const data = await res.json();
        const arr: AntrianItem[] = Array.isArray(data) ? data : [];
        setAntrian(arr);
        // Auto-select first patient on initial load only
        setSelectedPatient((prev) => prev ?? (arr.length > 0 ? arr[0] : null));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAntrian();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select patient → reset form ──
  function selectPatient(item: AntrianItem) {
    setSelectedPatient(item);
    setSystolic(""); setDiastolic(""); setSuhu(""); setDetakJantung("");
    setBeratBadan(""); setTinggiBadan(""); setCatatan("");
    setFieldErrors({}); setShowGlobalError(false);
  }

  function resetForm() {
    setSystolic(""); setDiastolic(""); setSuhu(""); setDetakJantung("");
    setBeratBadan(""); setTinggiBadan(""); setCatatan("");
    setFieldErrors({}); setShowGlobalError(false);
  }

  // ── Validate → open confirm modal ──
  function handleSubmitClick() {
    if (!selectedPatient) return;
    const errors = validateVitals(systolic, diastolic, suhu);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShowGlobalError(true);
      return;
    }
    setFieldErrors({}); setShowGlobalError(false);
    setShowConfirm(true);
  }

  // ── POST to API ──
  async function handleConfirmSubmit() {
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        id_pasien: selectedPatient.form_pendaftaran?.id_pasien ?? null,
        id_antrian: selectedPatient.id_antrian,
        tekanan_darah: `${systolic}/${diastolic}`,
        catatan: catatan || null,
      };
      if (suhu) body.suhu = parseFloat(suhu);
      if (beratBadan) body.berat_badan = parseFloat(beratBadan);

      const res = await fetch("/api/perawat/pemeriksaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowConfirm(false);
        // Remove patient from local list, auto-select next
        const nextAntrian = antrian.filter(
          (a) => a.id_antrian !== selectedPatient.id_antrian
        );
        setAntrian(nextAntrian);
        setSelectedPatient(nextAntrian.length > 0 ? nextAntrian[0] : null);
        resetForm();
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        setShowConfirm(false);
        toast.error(err.error || "Gagal menyimpan data vital signs");
      }
    } catch {
      setShowConfirm(false);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ──
  if (loading) return <PageSkeleton />;

  const patientNama = selectedPatient?.form_pendaftaran?.pasien?.nama ?? "—";
  const patientKeluhan = selectedPatient?.form_pendaftaran?.keluhan ?? "—";

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 lg:gap-8">

        {/* ── LEFT: Patient Queue ── */}
        <section className="lg:col-span-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              Daftar Pasien
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
              {antrian.length} Antrian
            </span>
          </div>

          {/* List — scrollable on desktop so form stays visible */}
          <div className="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1 space-y-3 scrollbar-thin">
            {antrian.length === 0 ? (
              <div
                className={`${GLASS} rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak Ada Antrian
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Belum ada pasien dalam antrian saat ini.
                </p>
              </div>
            ) : (
              antrian.map((item) => (
                <PatientCard
                  key={item.id_antrian}
                  item={item}
                  isActive={selectedPatient?.id_antrian === item.id_antrian}
                  onClick={() => selectPatient(item)}
                />
              ))
            )}
          </div>
        </section>

        {/* ── RIGHT: Vital Signs Form ── */}
        <section className="lg:col-span-8">
          <div className={`${GLASS} rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8`}>
            {!selectedPatient ? (
              <FormEmptyState />
            ) : (
              <>
                {/* Global error banner */}
                {showGlobalError && (
                  <div className="mb-4 md:mb-6 flex items-start gap-3 p-3 md:p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="shrink-0 w-8 h-8 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center mt-0.5">
                      <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                        Peringatan Validasi
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Beberapa parameter pemeriksaan berada di luar batas normal atau belum
                        terisi dengan benar. Mohon periksa kembali data yang dimasukkan.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowGlobalError(false)}
                      className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Form header */}
                <header className="border-b border-slate-200 dark:border-white/10 pb-4 md:pb-5 mb-5 md:mb-6 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                        Form Vital Signs
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                        Input data pemeriksaan awal pasien sebelum konsultasi dokter.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg">
                      <span className="block text-[9px] md:text-[10px] uppercase text-slate-400 font-bold leading-none mb-0.5">
                        Pasien
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                        {patientNama}
                      </span>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg max-w-[140px] md:max-w-[180px]">
                      <span className="block text-[9px] md:text-[10px] uppercase text-slate-400 font-bold leading-none mb-0.5">
                        Keluhan
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white truncate block">
                        {patientKeluhan}
                      </span>
                    </div>
                    <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-lg">
                      <span className="block text-[9px] md:text-[10px] uppercase text-primary/60 font-bold leading-none mb-0.5">
                        Antrian
                      </span>
                      <span className="text-xs md:text-sm font-bold text-primary">
                        {fmtNum(selectedPatient.nomor_antrian)}
                      </span>
                    </div>
                  </div>
                </header>

                {/* Form fields */}
                <div className="space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">

                    {/* Tekanan Darah */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-red-500" />
                        Tekanan Darah (mmHg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={systolic}
                          onChange={(e) => {
                            setSystolic(e.target.value);
                            if (fieldErrors.tekanan_darah)
                              setFieldErrors((p) => ({ ...p, tekanan_darah: "" }));
                          }}
                          placeholder="Systolic"
                          className={`flex-1 ${fieldErrors.tekanan_darah ? INPUT_ERROR : INPUT_NORMAL}`}
                        />
                        <span className="text-slate-400 dark:text-slate-500 font-bold text-xl shrink-0 select-none">
                          /
                        </span>
                        <input
                          type="number"
                          value={diastolic}
                          onChange={(e) => {
                            setDiastolic(e.target.value);
                            if (fieldErrors.tekanan_darah)
                              setFieldErrors((p) => ({ ...p, tekanan_darah: "" }));
                          }}
                          placeholder="Diastolic"
                          className={`flex-1 ${fieldErrors.tekanan_darah ? INPUT_ERROR : INPUT_NORMAL}`}
                        />
                      </div>
                      {fieldErrors.tekanan_darah && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.tekanan_darah}
                        </p>
                      )}
                    </div>

                    {/* Suhu Tubuh */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        Suhu Tubuh (°C)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={suhu}
                          onChange={(e) => {
                            setSuhu(e.target.value);
                            if (fieldErrors.suhu)
                              setFieldErrors((p) => ({ ...p, suhu: "" }));
                          }}
                          placeholder="36.5"
                          className={`${fieldErrors.suhu ? INPUT_ERROR : INPUT_NORMAL} pr-10`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none select-none">
                          °C
                        </span>
                      </div>
                      {fieldErrors.suhu && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {fieldErrors.suhu}
                        </p>
                      )}
                    </div>

                    {/* Detak Jantung */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-500" />
                        Detak Jantung (bpm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={detakJantung}
                          onChange={(e) => setDetakJantung(e.target.value)}
                          placeholder="80"
                          className={`${INPUT_NORMAL} pr-12`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none select-none">
                          bpm
                        </span>
                      </div>
                    </div>

                    {/* Berat Badan */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Weight className="w-4 h-4 text-blue-500" />
                        Berat Badan (kg)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={beratBadan}
                          onChange={(e) => setBeratBadan(e.target.value)}
                          placeholder="70"
                          className={`${INPUT_NORMAL} pr-10`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none select-none">
                          kg
                        </span>
                      </div>
                    </div>

                    {/* Tinggi Badan — spans half on sm */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-violet-500" />
                        Tinggi Badan (cm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={tinggiBadan}
                          onChange={(e) => setTinggiBadan(e.target.value)}
                          placeholder="170"
                          className={`${INPUT_NORMAL} pr-10`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none select-none">
                          cm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Tambahan */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-500" />
                      Catatan Tambahan (Keluhan Utama)
                    </label>
                    <textarea
                      rows={3}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tuliskan keluhan atau instruksi khusus..."
                      className={`${INPUT_NORMAL} resize-none md:min-h-[120px]`}
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      onClick={handleSubmitClick}
                      className="w-full py-3.5 md:py-4 bg-primary text-white font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 shadow-lg shadow-primary/40 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                      Simpan & Kirim ke Dokter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && !submitting && setShowConfirm(false)
          }
        >
          <div
            className={`${GLASS} w-full max-w-lg rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}
          >
            <div className="p-5 md:p-8 space-y-5 md:space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-2">
                  <ClipboardCheck className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  Konfirmasi Data
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                  Mohon periksa kembali data vital signs sebelum dikirim ke dokter.
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 bg-slate-50 dark:bg-white/5 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Tekanan Darah
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {systolic}/{diastolic}{" "}
                    <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Suhu Tubuh
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {suhu || "—"}{" "}
                    <span className="text-xs text-slate-400 font-normal">{suhu ? "°C" : ""}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Detak Jantung
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {detakJantung || "—"}{" "}
                    <span className="text-xs text-slate-400 font-normal">{detakJantung ? "bpm" : ""}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Berat Badan
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {beratBadan || "—"}{" "}
                    <span className="text-xs text-slate-400 font-normal">{beratBadan ? "kg" : ""}</span>
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">
                    Tinggi Badan
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {tinggiBadan || "—"}{" "}
                    <span className="text-xs text-slate-400 font-normal">{tinggiBadan ? "cm" : ""}</span>
                  </p>
                </div>
                {catatan && (
                  <div className="space-y-1 col-span-2 border-t border-slate-100 dark:border-white/5 pt-3">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">
                      Catatan
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                      {catatan}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => !submitting && setShowConfirm(false)}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors uppercase text-xs tracking-wider disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 uppercase text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {submitting ? "Menyimpan..." : "Ya, Kirim Sekarang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast (Portal — escapes layout stacking context) ── */}
      {showSuccessToast &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
            <div
              className={`${GLASS} border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-2xl sm:min-w-[340px]`}
            >
              <div className="shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                  Berhasil
                </p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Data Vital Signs Berhasil Dikirim ke Dokter
                </p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
