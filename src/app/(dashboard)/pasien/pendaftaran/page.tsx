"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  Users,
  Info,
  ArrowRight,
  ShieldCheck,
  X,
  LayoutDashboard,
  ListOrdered,
  Stethoscope,
  DoorOpen,
  CheckCircle2,
  ChevronDown,
  User,
  ClipboardList,
  History,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

// ─── Static data (UI only, no dedicated API for pasien to browse doctors) ───

const POLIKLINIK_LIST = [
  { value: "umum", label: "Poli Umum" },
  { value: "gigi", label: "Poli Gigi" },
  { value: "anak", label: "Poli Anak" },
  { value: "kandungan", label: "Poli Kandungan" },
  { value: "spesialis", label: "Poli Spesialis" },
];

const DOKTER_LIST = [
  {
    value: "andi",
    nama: "dr. Andi Wijaya",
    spesialisasi: "Spesialis Umum",
    jadwal: "08:00 – 14:00",
    antrian: 5,
  },
  {
    value: "budi",
    nama: "dr. Budi Setiawan",
    spesialisasi: "Dokter Umum",
    jadwal: "14:00 – 20:00",
    antrian: 3,
  },
  {
    value: "citra",
    nama: "dr. Citra Lestari",
    spesialisasi: "Spesialis Anak",
    jadwal: "08:00 – 12:00",
    antrian: 7,
  },
  {
    value: "dewi",
    nama: "dr. Dewi Santosa",
    spesialisasi: "Dokter Kandungan",
    jadwal: "10:00 – 16:00",
    antrian: 4,
  },
];

// ─── Glass panel helper class ────────────────────────────────────────────────

const GLASS =
  "bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/10";

// ─── Success View ────────────────────────────────────────────────────────────

function SuccessView({
  keluhan,
  dokterNama,
  poliklinikLabel,
  onBack,
}: {
  keluhan: string;
  dokterNama: string;
  poliklinikLabel: string;
  onBack: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8 animate-fade-in">
      <div className="w-full max-w-[520px] mx-auto">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div
          className={`relative ${GLASS} rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl`}
        >
          {/* Check icon */}
          <div className="mb-6 relative">
            <div className="bg-emerald-500/20 rounded-full p-6 inline-flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight text-foreground">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Pendaftaran Anda telah tercatat di sistem kami.
          </p>

          {/* Status card */}
          <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
              Status Pendaftaran
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <StatusBadge status="pending" />
            </div>
            <p className="text-muted-foreground text-sm">
              Menunggu verifikasi dari admin. Nomor antrian akan diberikan setelah diverifikasi.
            </p>
          </div>

          {/* Info grid */}
          <div className="w-full space-y-3 mb-8">
            {/* Doctor */}
            <div
              className={`${GLASS} rounded-xl p-4 flex items-center gap-4 text-left`}
            >
              <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Dokter Dipilih</p>
                <p className="text-sm font-semibold text-foreground">
                  {dokterNama || "Sesuai ketersediaan"}
                </p>
              </div>
            </div>

            {/* Poliklinik + Keluhan */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`${GLASS} rounded-xl p-4 flex items-center gap-3 text-left`}>
                <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                  <DoorOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Poliklinik</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {poliklinikLabel || "Umum"}
                  </p>
                </div>
              </div>
              <div className={`${GLASS} rounded-xl p-4 flex items-center gap-3 text-left`}>
                <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Keluhan</p>
                  <p className="text-sm font-semibold text-foreground line-clamp-2">
                    {keluhan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => router.push("/pasien")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              <LayoutDashboard className="w-5 h-5" />
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => router.push("/pasien/antrian")}
              className="w-full bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground font-semibold py-4 px-6 rounded-xl border border-border transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ListOrdered className="w-5 h-5" />
              Lihat Status Antrian
            </button>
            <button
              onClick={onBack}
              className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
            >
              Daftar Lagi
            </button>
          </div>

          <div className="mt-8">
            <p className="text-muted-foreground/60 text-xs flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              Klinik Sehat Selalu – Melayani dengan Sepenuh Hati
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PendaftaranPage() {
  const [poliklinik, setPoliklinik] = useState("");
  const [dokterVal, setDokterVal] = useState("");
  const [keluhan, setKeluhan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedDokter = DOKTER_LIST.find((d) => d.value === dokterVal) ?? null;
  const selectedPoli = POLIKLINIK_LIST.find((p) => p.value === poliklinik) ?? null;

  function handleOpenModal() {
    if (!keluhan.trim()) {
      toast.error("Keluhan utama wajib diisi");
      return;
    }
    setShowModal(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const permintaan_khusus = [
        selectedPoli ? `Poliklinik: ${selectedPoli.label}` : null,
        selectedDokter ? `Dokter: ${selectedDokter.nama}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      const res = await fetch("/api/pasien/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keluhan,
          permintaan_khusus: permintaan_khusus || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal mengirim pendaftaran");
        return;
      }

      setShowModal(false);
      setSubmitted(true);
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SuccessView
        keluhan={keluhan}
        dokterNama={selectedDokter?.nama ?? ""}
        poliklinikLabel={selectedPoli?.label ?? ""}
        onBack={() => {
          setSubmitted(false);
          setKeluhan("");
          setPoliklinik("");
          setDokterVal("");
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Form ── */}
        <section
          className={`lg:col-span-2 ${GLASS} rounded-2xl p-6 md:p-10 shadow-2xl`}
        >
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Pendaftaran Kunjungan
            </h1>
            <p className="text-muted-foreground">
              Pilih layanan dan dokter untuk hari ini.
            </p>
          </header>

          <div className="space-y-6">
            {/* Poliklinik */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">
                Pilih Poliklinik
              </label>
              <div className="relative group">
                <select
                  value={poliklinik}
                  onChange={(e) => setPoliklinik(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 pr-10 appearance-none
                    bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10
                    text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all duration-300 cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Layanan Poliklinik
                  </option>
                  {POLIKLINIK_LIST.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Dokter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">
                Pilih Dokter
              </label>
              <div className="relative group">
                <select
                  value={dokterVal}
                  onChange={(e) => setDokterVal(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 pr-10 appearance-none
                    bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10
                    text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    transition-all duration-300 cursor-pointer"
                >
                  <option value="" disabled>
                    Pilih Dokter Tersedia
                  </option>
                  {DOKTER_LIST.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.nama} – {d.spesialisasi}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Keluhan */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">
                Keluhan Utama <span className="text-red-500">*</span>
              </label>
              <textarea
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                rows={4}
                placeholder="Tuliskan gejala atau keluhan Anda di sini..."
                className="w-full rounded-xl py-3 px-4 resize-none
                  bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10
                  text-foreground placeholder:text-muted-foreground/60
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all duration-300"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                onClick={handleOpenModal}
                className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-8
                  rounded-xl flex items-center justify-center gap-2
                  transition-all duration-300 hover:-translate-y-1
                  shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                <span>Ambil Nomor Antrian</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Right: Doctor Info Card ── */}
        <aside className="lg:col-span-1 space-y-4">
          <div className={`${GLASS} rounded-2xl p-6 shadow-xl sticky top-6`}>
            {selectedDokter ? (
              /* Selected doctor card */
              <div className="flex flex-col items-center text-center gap-4">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-primary/30 p-1 flex items-center justify-center bg-primary/10">
                  <User className="w-12 h-12 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedDokter.nama}
                  </h2>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                    {selectedDokter.spesialisasi}
                  </span>
                </div>

                <div className="w-full space-y-3 mt-2">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="text-sm text-left leading-tight">
                      <p className="text-muted-foreground text-xs">Jadwal</p>
                      <p className="text-foreground font-medium">
                        {selectedDokter.jadwal}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <Users className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="text-sm text-left leading-tight">
                      <p className="text-muted-foreground text-xs">Total Antrian</p>
                      <p className="text-foreground font-medium">
                        {selectedDokter.antrian} Pasien
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-left">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-500/80">
                    Estimasi waktu tunggu sekitar{" "}
                    {selectedDokter.antrian * 6} menit. Harap datang 10 menit
                    sebelum nomor dipanggil.
                  </p>
                </div>
              </div>
            ) : (
              /* Placeholder when no doctor selected */
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary/30" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pilih dokter untuk melihat
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    jadwal dan ketersediaan
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {DOKTER_LIST.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDokterVal(d.value)}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-200 group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {d.nama}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.spesialisasi} · {d.jadwal}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent history mini */}
          <RiwayatMini />
        </aside>
      </div>

      {/* ── Confirmation Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal */}
          <div
            className={`relative w-full max-w-md ${GLASS} rounded-2xl p-8 shadow-2xl border border-white/10 animate-slide-up`}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Konfirmasi Pendaftaran
              </h3>
              <p className="text-muted-foreground text-sm italic">
                Apakah data yang Anda masukkan sudah benar?
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
              {selectedDokter && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Dokter</span>
                  <span className="text-foreground font-medium">
                    {selectedDokter.nama}
                  </span>
                </div>
              )}
              {selectedPoli && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Poliklinik</span>
                  <span className="text-foreground font-medium">
                    {selectedPoli.label}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start text-sm gap-4">
                <span className="text-muted-foreground shrink-0">Keluhan</span>
                <span className="text-foreground font-medium text-right line-clamp-2">
                  {keluhan}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-bold py-4 rounded-xl transition-all duration-200
                  shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5"
              >
                {loading ? "Memproses..." : "Konfirmasi & Ambil Antrian"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini riwayat sidebar component ─────────────────────────────────────────

function RiwayatMini() {
  const [items, setItems] = useState<any[] | null>(null);

  // Fetch on mount
  useEffect(() => {
    fetch("/api/pasien/pendaftaran")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`${GLASS} rounded-2xl p-5 shadow-xl`}
    >
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Riwayat Terakhir</h3>
      </div>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id_form} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {new Date(item.tanggal_daftar).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-foreground line-clamp-1">{item.keluhan}</p>
            </div>
            <div className="shrink-0">
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
