"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Printer,
  Save,
  FileText,
  CalendarClock,
  Send,
  ClipboardX,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AntrianItem {
  id_rekam: number;
  id_pasien: number;
  tekanan_darah: string | null;
  suhu: number | null;
  berat_badan: number | null;
  catatan: string | null; // nurse notes
  tanggal_periksa: string;
  keluhan?: string | null;
  pasien: { nama: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10";

const INPUT =
  "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200 text-sm";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function queueNum(id: number) {
  return `A${String(id).padStart(3, "0")}`;
}

function patientId(id: number) {
  return `ID-${id}`;
}

function fmtTime(iso: string) {
  try {
    return (
      new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  } catch {
    return "—";
  }
}

function getInitials(nama: string) {
  return nama
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ onClose }: { onClose: () => void }) {
  if (typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-[9999] animate-in slide-in-from-right-full duration-300">
      <div
        className={`${GLASS} border-emerald-500/30 dark:border-emerald-500/30 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl sm:min-w-[340px]`}
      >
        <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-white">Berhasil!</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Diagnosis berhasil disimpan</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Error Toast ──────────────────────────────────────────────────────────────

function ErrorToast({ msg, onClose }: { msg: string; onClose: () => void }) {
  if (typeof window === "undefined") return null;
  return createPortal(
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-[9999] animate-in slide-in-from-right-full duration-300">
      <div
        className={`${GLASS} border-red-500/30 dark:border-red-500/30 flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl sm:min-w-[340px]`}
      >
        <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-white">Gagal</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{msg}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[calc(100vh-5rem)]">
        {/* Left */}
        <div className="lg:col-span-4 p-4 md:p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/8">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        {/* Right */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-white/8 bg-slate-100 dark:bg-white/3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-5 space-y-6">
            <div className="grid grid-cols-5 gap-3">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Patient List Card ────────────────────────────────────────────────────────

function PatientCard({
  item,
  isActive,
  onClick,
}: {
  item: AntrianItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const nama = item.pasien?.nama ?? "Pasien";
  const qn = queueNum(item.id_rekam);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-2 border-primary bg-primary/5 dark:bg-primary/10"
          : "border border-slate-200 dark:border-white/8 bg-white/60 dark:bg-white/3 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-white/20 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-3xl font-black leading-none ${
            isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {qn}
        </span>
        <span className="text-[9px] uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md font-bold border border-emerald-500/30">
          Siap Periksa
        </span>
      </div>
      <h3 className={`text-sm font-semibold mb-0.5 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
        {nama}
      </h3>
      {item.keluhan && (
        <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
          {item.keluhan}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Clock className="w-3 h-3 shrink-0" />
        Terdaftar: {fmtTime(item.tanggal_periksa)}
      </div>
    </button>
  );
}

// ─── Vital Box ────────────────────────────────────────────────────────────────

function VitalBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-2 md:p-3 text-center">
      <p className="text-[8px] md:text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-0.5 md:mb-1 truncate">{label}</p>
      <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

// ─── Follow-up Card ───────────────────────────────────────────────────────────

function FollowupCard({
  checked,
  onChange,
  icon: Icon,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <label className="relative cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`bg-slate-50 dark:bg-black/20 border rounded-xl md:rounded-2xl p-2.5 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 text-center transition-all duration-200 h-full
          ${checked
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-slate-200 dark:border-white/8 peer-checked:border-primary hover:border-primary/40"
          }`}
      >
        <Icon
          className={`w-5 h-5 md:w-7 md:h-7 transition-colors duration-200 ${
            checked ? "text-primary" : "text-slate-400 group-hover:text-primary"
          }`}
        />
        <div>
          <p className={`font-bold text-[11px] md:text-sm leading-tight ${checked ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
            {label}
          </p>
          <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden md:block">{description}</p>
        </div>
      </div>
    </label>
  );
}

// ─── Right Panel Placeholder ──────────────────────────────────────────────────

function RightPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 flex items-center justify-center">
        <Stethoscope className="w-9 h-9 text-primary" />
      </div>
      <div>
        <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">
          Pilih Pasien
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
          Pilih pasien dari daftar antrian untuk memulai pemeriksaan dan input diagnosis
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DokterPemeriksaanPage() {
  const router = useRouter();

  const [antrian, setAntrian] = useState<AntrianItem[]>([]);
  const [selected, setSelected] = useState<AntrianItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [diagnosa, setDiagnosa] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [buatResep, setBuatResep] = useState(false);
  const [buatRujukan, setBuatRujukan] = useState(false);
  const [rujukanText, setRujukanText] = useState("");
  const [kontrolLanjutan, setKontrolLanjutan] = useState(false);

  // UI
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchAntrian = useCallback(async () => {
    try {
      const res = await fetch("/api/dokter/antrian");
      if (res.ok) {
        const data = await res.json();
        setAntrian(Array.isArray(data) ? data : []);
      }
    } catch {
      /* network error — silently handled */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAntrian(); }, [fetchAntrian]);

  function selectPatient(item: AntrianItem) {
    setSelected(item);
    // Reset form on new selection
    setDiagnosa("");
    setTindakan("");
    setCatatan("");
    setBuatResep(false);
    setBuatRujukan(false);
    setRujukanText("");
    setKontrolLanjutan(false);
    setErrorMsg(null);
  }

  async function handleSubmit() {
    if (!selected) return;
    if (!diagnosa.trim()) {
      setErrorMsg("Diagnosa wajib diisi sebelum menyimpan");
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    const catatanFull = tindakan.trim()
      ? `Tindakan: ${tindakan.trim()}\n\n${catatan.trim()}`
      : catatan.trim();

    setSubmitting(true);
    try {
      const res = await fetch("/api/dokter/pemeriksaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rekam: selected.id_rekam,
          diagnosa: diagnosa.trim(),
          catatan: catatanFull || null,
          rujukan: buatRujukan ? rujukanText.trim() || null : null,
          kontrol_lanjutan: kontrolLanjutan,
        }),
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setSelected(null);
        setDiagnosa(""); setTindakan(""); setCatatan("");
        setBuatResep(false); setBuatRujukan(false);
        setRujukanText(""); setKontrolLanjutan(false);
        await fetchAntrian();
        if (buatResep) router.push("/dokter/resep");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Gagal menyimpan diagnosis");
        setTimeout(() => setErrorMsg(null), 3500);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
      setTimeout(() => setErrorMsg(null), 3500);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Skeleton />;

  const nama = selected?.pasien?.nama ?? "";
  const initials = nama ? getInitials(nama) : "?";
  const qn = selected ? queueNum(selected.id_rekam) : "";

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">

      {/* Toasts */}
      {mounted && showSuccess && <SuccessToast onClose={() => setShowSuccess(false)} />}
      {mounted && errorMsg && <ErrorToast msg={errorMsg} onClose={() => setErrorMsg(null)} />}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 lg:gap-8">

        {/* ── Left: Patient Queue ── */}
        <section className="lg:col-span-4 space-y-3">

          {/* Sidebar header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              Antrian Pasien
            </h2>
            {antrian.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                {antrian.length} Menunggu
              </span>
            )}
          </div>

          {/* Patient list — scroll only on desktop */}
          <div className="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1 space-y-3">
            {antrian.length === 0 ? (
              <div className={`${GLASS} rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                  <ClipboardX className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  Tidak Ada Pasien Menunggu
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Pasien yang sudah diperiksa perawat akan muncul di sini
                </p>
              </div>
            ) : (
              antrian.map((item) => (
                <PatientCard
                  key={item.id_rekam}
                  item={item}
                  isActive={selected?.id_rekam === item.id_rekam}
                  onClick={() => selectPatient(item)}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Right: Exam Form ── */}
        <section className="lg:col-span-8">

          {!selected ? (
            /* Placeholder */
            <div className={`${GLASS} rounded-2xl md:rounded-3xl overflow-hidden`}>
              <RightPlaceholder />
            </div>
          ) : (
            /* Exam form */
            <div className={`${GLASS} rounded-2xl md:rounded-3xl overflow-hidden`}>

              {/* Form Header */}
              <div className="px-4 md:px-6 py-3 md:py-5 border-b border-slate-200 dark:border-white/8 bg-slate-100/50 dark:bg-white/3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-full bg-primary/15 dark:bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm md:text-xl">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h1 className="text-base md:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                          {nama}
                        </h1>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                          {patientId(selected.id_rekam)}
                        </span>
                      </div>
                      {selected.keluhan && (
                        <p className="text-slate-500 dark:text-slate-400 flex items-start gap-1 text-xs md:text-sm">
                          <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 md:line-clamp-1">
                            <span className="font-medium">Keluhan: </span>
                            <span className="text-slate-700 dark:text-slate-300">{selected.keluhan}</span>
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Queue number */}
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5 hidden md:block">Queue</p>
                    <p className="text-2xl md:text-4xl font-black text-primary leading-none">{qn}</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-7">

                {/* Vitals section */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Tanda-Tanda Vital
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 mb-3">
                    <VitalBox label="TD (mmHg)" value={selected.tekanan_darah ?? "—"} />
                    <VitalBox label="Suhu (°C)" value={selected.suhu != null ? String(selected.suhu) : "—"} />
                    <VitalBox label="Nadi (bpm)" value="—" />
                    <VitalBox label="BB (kg)" value={selected.berat_badan != null ? String(selected.berat_badan) : "—"} />
                    <VitalBox label="TB (cm)" value="—" />
                  </div>

                  {/* Nurse notes */}
                  {selected.catatan && (
                    <div className="bg-slate-50 dark:bg-black/20 border-l-4 border-l-primary/50 border border-slate-100 dark:border-white/5 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        <strong className="text-slate-700 dark:text-slate-300 not-italic font-semibold mr-1.5">
                          Catatan Perawat:
                        </strong>
                        {selected.catatan}
                      </p>
                    </div>
                  )}
                </div>

                {/* Diagnosis + Tindakan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Diagnosa (ICD-10) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={diagnosa}
                      onChange={(e) => setDiagnosa(e.target.value)}
                      placeholder="Cari kode atau nama penyakit..."
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Tindakan
                    </label>
                    <input
                      type="text"
                      value={tindakan}
                      onChange={(e) => setTindakan(e.target.value)}
                      placeholder="Input tindakan medis..."
                      className={INPUT}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Catatan Dokter / Anamnesa Lanjut
                    </label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tuliskan detail pemeriksaan fisik dan instruksi khusus..."
                      rows={3}
                      className={`${INPUT} resize-none`}
                    />
                  </div>
                </div>

                {/* Tindak Lanjut */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Tindak Lanjut
                  </h4>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <FollowupCard
                      checked={buatResep}
                      onChange={setBuatResep}
                      icon={FileText}
                      label="Resep Obat"
                      description="Berikan resep digital"
                    />
                    <FollowupCard
                      checked={buatRujukan}
                      onChange={setBuatRujukan}
                      icon={Send}
                      label="Rujukan"
                      description="Rujuk ke RS/Spesialis"
                    />
                    <FollowupCard
                      checked={kontrolLanjutan}
                      onChange={setKontrolLanjutan}
                      icon={CalendarClock}
                      label="Kontrol Ulang"
                      description="Atur jadwal pertemuan"
                    />
                  </div>

                  {/* Rujukan text input (conditional) */}
                  {buatRujukan && (
                    <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        value={rujukanText}
                        onChange={(e) => setRujukanText(e.target.value)}
                        placeholder="Rujuk ke (nama RS / spesialis)..."
                        className={INPUT}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Form Footer */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-200 dark:border-white/8 bg-slate-50/80 dark:bg-white/3 flex gap-2 md:gap-3">
                <button
                  onClick={() => window.print()}
                  title="Cetak Diagnosis"
                  className={`${GLASS} hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all duration-200 flex items-center justify-center group`}
                >
                  <Printer className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 md:py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Diagnosis &amp; Lanjutkan
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
