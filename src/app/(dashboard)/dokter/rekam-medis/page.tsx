"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  ClipboardList,
  Stethoscope,
  FileText,
  ChevronDown,
  ChevronLeft,
  Plus,
  User,
  AlertCircle,
  Heart,
  CalendarDays,
  RotateCcw,
  ArrowUpRight,
  Pill,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RekamMedisItem {
  id_rekam: number;
  id_pasien: number;
  tekanan_darah: string | null;
  suhu: number | null;
  berat_badan: number | null;
  catatan: string | null;
  tanggal_periksa: string;
  diagnosa: string | null;
  rujukan: string | null;
  kontrol_lanjutan: boolean;
  keluhan?: string | null;
  pasien: { nama: string } | null;
}

interface PatientSummary {
  id_pasien: number;
  nama: string;
  recordCount: number;
  lastVisit: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10";

const PREVIEW_COUNT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Split catatan field: if starts with "Tindakan: ...", extract tindakan and rest */
function parseCatatan(catatan: string | null): { tindakan: string | null; notes: string | null } {
  if (!catatan) return { tindakan: null, notes: null };
  const match = catatan.match(/^Tindakan:\s*(.+?)(?:\n\n([\s\S]*))?$/i);
  if (match) {
    return {
      tindakan: match[1]?.trim() || null,
      notes: match[2]?.trim() || null,
    };
  }
  return { tindakan: null, notes: catatan };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen animate-pulse space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Patient List Card ────────────────────────────────────────────────────────

function PatientListCard({
  patient,
  onClick,
}: {
  patient: PatientSummary;
  onClick: () => void;
}) {
  const initials = getInitials(patient.nama);
  return (
    <button
      onClick={onClick}
      className={`${GLASS} w-full text-left rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 shrink-0 rounded-full bg-primary/15 dark:bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base group-hover:text-primary transition-colors duration-200">
          {patient.nama}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <CalendarDays className="w-3 h-3 shrink-0" />
            Terakhir: {fmtDateShort(patient.lastVisit)}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <FileText className="w-3 h-3 shrink-0" />
            {patient.recordCount} kunjungan
          </span>
        </div>
      </div>

      <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
    </button>
  );
}

// ─── Visit Card ───────────────────────────────────────────────────────────────

function VisitCard({ record, isFirst }: { record: RekamMedisItem; isFirst: boolean }) {
  const { tindakan, notes } = parseCatatan(record.catatan);

  return (
    <div
      className={`${GLASS} rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-t-2 ${
        isFirst ? "border-t-primary/60" : "border-t-transparent hover:border-t-primary/20"
      } ${!isFirst ? "opacity-90 hover:opacity-100" : ""}`}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
            {fmtDate(record.tanggal_periksa)}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1.5 mt-1">
            <User className="w-3.5 h-3.5 shrink-0" />
            Ditangani dokter ini
          </p>
        </div>
        <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/20">
          Selesai
        </span>
      </div>

      {/* Card Body – 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Keluhan */}
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center mt-0.5">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Keluhan
              </p>
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                {record.keluhan || notes || (
                  <span className="text-slate-400 dark:text-slate-600 italic">Tidak tercatat</span>
                )}
              </p>
            </div>
          </div>

          {/* Diagnosa */}
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center mt-0.5">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Diagnosa
              </p>
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                {record.diagnosa || (
                  <span className="text-slate-400 dark:text-slate-600 italic">Belum diisi</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Tindakan / Catatan */}
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center mt-0.5">
              <Pill className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                {tindakan ? "Tindakan" : "Catatan"}
              </p>
              <p className="text-slate-700 dark:text-slate-200 text-sm">
                {tindakan || notes || (
                  <span className="text-slate-400 dark:text-slate-600 italic">Tidak ada</span>
                )}
              </p>
            </div>
          </div>

          {/* Rujukan */}
          <div className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center mt-0.5">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Rujukan
              </p>
              {record.rujukan ? (
                <p className="text-slate-700 dark:text-slate-200 text-sm">{record.rujukan}</p>
              ) : (
                <p className="text-slate-400 dark:text-slate-600 italic text-sm">
                  Tidak ada rujukan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals footer (compact) */}
      {(record.tekanan_darah || record.suhu || record.berat_badan || record.kontrol_lanjutan) && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
          {record.tekanan_darah && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              <Heart className="w-3 h-3 text-red-400 shrink-0" />
              TD: {record.tekanan_darah}
            </span>
          )}
          {record.suhu != null && (
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              Suhu: {record.suhu}°C
            </span>
          )}
          {record.berat_badan != null && (
            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              BB: {record.berat_badan} kg
            </span>
          )}
          {record.kontrol_lanjutan && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <RotateCcw className="w-3 h-3 shrink-0" />
              Kontrol Ulang
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptySearch({ query }: { query: string }) {
  return (
    <div className={`${GLASS} rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center`}>
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-7 h-7 text-slate-400" />
      </div>
      <div>
        <p className="font-bold text-slate-700 dark:text-slate-200">
          {query ? `Tidak ditemukan: "${query}"` : "Belum Ada Rekam Medis"}
        </p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          {query
            ? "Coba periksa ejaan nama pasien"
            : "Rekam medis pasien yang Anda tangani akan muncul di sini"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DokterRekamMedisPage() {
  const [records, setRecords] = useState<RekamMedisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/dokter/rekam-medis")
      .then((r) => r.json())
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive unique patients from records
  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<number, PatientSummary>();
    for (const r of records) {
      if (!map.has(r.id_pasien)) {
        map.set(r.id_pasien, {
          id_pasien: r.id_pasien,
          nama: r.pasien?.nama ?? `Pasien #${r.id_pasien}`,
          recordCount: 0,
          lastVisit: r.tanggal_periksa,
        });
      }
      const p = map.get(r.id_pasien)!;
      p.recordCount += 1;
      if (r.tanggal_periksa > p.lastVisit) p.lastVisit = r.tanggal_periksa;
    }
    return Array.from(map.values()).sort((a, b) =>
      b.lastVisit.localeCompare(a.lastVisit)
    );
  }, [records]);

  // Filter patients by search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter((p) => p.nama.toLowerCase().includes(q));
  }, [patients, searchQuery]);

  // Records for selected patient
  const patientRecords = useMemo(() => {
    if (!selectedPatient) return [];
    return records.filter((r) => r.id_pasien === selectedPatient.id_pasien);
  }, [records, selectedPatient]);

  const displayedRecords = showAll ? patientRecords : patientRecords.slice(0, PREVIEW_COUNT);

  if (loading) return <Skeleton />;

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">

        {/* ── Header ── */}
        <header>
          {selectedPatient && (
            <button
              onClick={() => { setSelectedPatient(null); setShowAll(false); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors mb-4 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Semua Pasien
            </button>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Rekam Medis Pasien
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg flex items-center gap-2 mt-2">
            <ClipboardList className="w-5 h-5 text-primary shrink-0" />
            Klinik Sehat Selalu
          </p>
        </header>

        {/* ── Search Bar ── */}
        <section>
          <div className="bg-white dark:bg-[rgba(15,23,42,0.6)] border border-slate-200 dark:border-white/5 backdrop-blur-sm rounded-full flex items-center shadow-lg focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/40 transition-all duration-200">
            <div className="pl-5 pr-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedPatient) { setSelectedPatient(null); setShowAll(false); }
              }}
              placeholder="Cari berdasarkan nama pasien..."
              className="bg-transparent border-none focus:outline-none focus:ring-0 flex-grow text-base md:text-lg py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={() => {
                const q = searchQuery.trim();
                if (!q) return;
                const match = filteredPatients[0];
                if (match) setSelectedPatient(match);
              }}
              className="bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold rounded-full transition-all duration-200 shadow-md mr-1 py-3 px-3 md:px-8"
            >
              <span className="hidden md:inline text-sm md:text-base font-bold">Cari</span>
              <Search className="w-5 h-5 md:hidden" />
            </button>
          </div>
        </section>

        {/* ── Patient Profile (selected) ── */}
        {selectedPatient && (
          <section className="animate-in slide-in-from-top-4 duration-300">
            <div className={`${GLASS} rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-xl border-l-4 border-l-primary`}>
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/15 dark:bg-primary/20 border-4 border-primary/20 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-black text-primary">
                    {getInitials(selectedPatient.nama)}
                  </span>
                </div>
                <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-[#101322]" />
              </div>

              {/* Info */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {selectedPatient.nama}
                  </h2>
                  <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
                    Pasien
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-base mb-4 flex items-center justify-center md:justify-start gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  ID: {selectedPatient.id_pasien}
                  <span className="opacity-30 mx-1">|</span>
                  {selectedPatient.recordCount} Kunjungan
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                    <Search className="w-4 h-4" />
                    Lihat Detail Profil
                  </button>
                  <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                    <FileText className="w-4 h-4" />
                    Cetak Rekam Medis
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Content ── */}
        {!selectedPatient ? (
          /* ─ Patient List ─ */
          <section className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                {searchQuery ? `Hasil pencarian "${searchQuery}"` : "Semua Pasien"}
              </h2>
              <span className="text-sm text-slate-400 dark:text-slate-500">
                {filteredPatients.length} pasien
              </span>
            </div>

            {filteredPatients.length === 0 ? (
              <EmptySearch query={searchQuery} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {filteredPatients.map((p) => (
                  <PatientListCard
                    key={p.id_pasien}
                    patient={p}
                    onClick={() => { setSelectedPatient(p); setShowAll(false); setSearchQuery(""); }}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ─ Visit History ─ */
          <section className="space-y-6 animate-in fade-in duration-300">
            {/* Section header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary shrink-0" />
                Riwayat Kunjungan
              </h3>
              <span className="text-sm text-slate-400 dark:text-slate-500">
                Menampilkan {displayedRecords.length} dari {patientRecords.length} kunjungan
              </span>
            </div>

            {/* Visit cards */}
            {patientRecords.length === 0 ? (
              <EmptySearch query="" />
            ) : (
              <div className="space-y-5">
                {displayedRecords.map((r, i) => (
                  <VisitCard key={r.id_rekam} record={r} isFirst={i === 0} />
                ))}
              </div>
            )}

            {/* Load more / collapse */}
            {patientRecords.length > PREVIEW_COUNT && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="flex items-center gap-2 text-primary hover:text-blue-600 font-semibold transition-all duration-200 group"
                >
                  {showAll ? "Sembunyikan" : "Lihat Seluruh Riwayat"}
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5 ${showAll ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}
          </section>
        )}

      </div>

      {/* ── Sticky FAB ── */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <button
          title="Tambah Rekam Medis"
          onClick={() => { window.location.href = "/dokter/pemeriksaan"; }}
          className="bg-primary hover:bg-blue-600 active:scale-95 text-white w-14 h-14 rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-all duration-200"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
