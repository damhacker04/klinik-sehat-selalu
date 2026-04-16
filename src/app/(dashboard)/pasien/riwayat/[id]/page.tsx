"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Stethoscope,
  MapPin,
  FileText,
  Pill,
  Clock,
  Printer,
  Download,
  ChevronRight,
} from "lucide-react";

type DetailResep = {
  jumlah: number;
  dosis: string | null;
  obat: { nama_obat: string; satuan: string | null; jenis: string | null } | null;
};

type Resep = {
  id_resep: string;
  status: string;
  tanggal_resep: string | null;
  detail_resep: DetailResep[];
};

type RiwayatDetail = {
  id_rekam: string;
  tanggal_periksa: string;
  tekanan_darah: string | null;
  suhu: number | null;
  berat_badan: number | null;
  diagnosa: string | null;
  catatan: string | null;
  rujukan: string | null;
  dokter: { nama: string; spesialisasi: string | null } | null;
  resep: Resep[] | null;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: "Selesai", cls: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
    pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
    processing: { label: "Diproses", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
    rejected: { label: "Ditolak", cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function RiwayatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<RiwayatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/pasien/riwayat/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Tidak ditemukan");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function formatTanggal(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const activeResep = data?.resep?.[0] ?? null;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 bg-muted rounded-xl" />
          <div className="h-80 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <FileText className="w-12 h-12 opacity-30" />
        <p className="text-sm">{error || "Data tidak ditemukan."}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm font-medium">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <button
            onClick={() => router.push("/pasien/riwayat")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Riwayat
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="text-primary">Detail Rekam Medis</span>
        </nav>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card dark:bg-primary/5 text-foreground hover:bg-muted/80 transition-all text-sm font-semibold"
          >
            <Printer className="w-4 h-4" />
            Cetak Rekam Medis
          </button>
          <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-sm font-semibold shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Unduh PDF
          </button>
        </div>
      </div>

      {/* Patient Overview Card */}
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-xl">
            <FileText className="w-9 h-9 text-white" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              ID #{data.id_rekam.slice(0, 13).toUpperCase()}
            </h1>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 uppercase tracking-wider">
              {data.dokter?.spesialisasi ?? "Poli Umum"}
            </span>
            {activeResep && <StatusBadge status={activeResep.status} />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Tanggal Kunjungan
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatTanggal(data.tanggal_periksa)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Dokter Pemeriksa
                </p>
                <p className="text-sm font-medium text-foreground">
                  {data.dokter?.nama ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Lokasi Klinik
                </p>
                <p className="text-sm font-medium text-foreground">
                  Klinik Sehat Selalu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ringkasan Klinis */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-7 space-y-7">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Ringkasan Klinis</h2>
          </div>

          {/* Vital Signs (if present) */}
          {(data.tekanan_darah || data.suhu || data.berat_badan) && (
            <div className="grid grid-cols-3 gap-3">
              {data.tekanan_darah && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Tekanan Darah
                  </p>
                  <p className="text-base font-bold text-foreground mt-1">
                    {data.tekanan_darah}
                  </p>
                </div>
              )}
              {data.suhu && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Suhu
                  </p>
                  <p className="text-base font-bold text-foreground mt-1">
                    {data.suhu}°C
                  </p>
                </div>
              )}
              {data.berat_badan && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    Berat Badan
                  </p>
                  <p className="text-base font-bold text-foreground mt-1">
                    {data.berat_badan} kg
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-7">
            {/* Diagnosis */}
            <div className="relative pl-6 border-l-2 border-primary/30">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Diagnosis
              </h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-lg font-bold text-primary">
                  {data.diagnosa ?? "—"}
                </p>
              </div>
            </div>

            {/* Catatan Dokter */}
            {data.catatan && (
              <div className="relative pl-6 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Catatan Dokter
                </h3>
                <div className="bg-muted/50 dark:bg-slate-800/50 border border-border/60 dark:border-border/30 p-5 rounded-xl italic text-muted-foreground leading-relaxed text-sm">
                  "{data.catatan}"
                </div>
              </div>
            )}

            {/* Rujukan */}
            {data.rujukan && (
              <div className="relative pl-6 border-l-2 border-primary/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Rujukan
                </h3>
                <p className="text-sm text-foreground">{data.rujukan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resep Obat */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Pill className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Resep Obat</h2>
          </div>

          {!activeResep || activeResep.detail_resep.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Pill className="w-10 h-10 opacity-20" />
              <p className="text-sm text-center">
                Tidak ada resep obat untuk kunjungan ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeResep.detail_resep.map((dr, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-xl bg-muted/30 dark:bg-slate-800/40 border border-border/60 dark:border-border/30 hover:border-primary/40 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                      {dr.obat?.nama_obat ?? "Obat"}
                    </h4>
                    {dr.obat?.jenis && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                        {dr.obat.jenis}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{dr.jumlah}x {dr.obat?.satuan ?? "pcs"}</span>
                  </div>
                  {dr.dosis && (
                    <div className="text-xs text-muted-foreground/80 bg-muted/50 dark:bg-slate-900/50 p-2 rounded-lg">
                      {dr.dosis}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-6 p-5 bg-primary/5 rounded-xl border border-dashed border-primary/30 text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Butuh penebusan obat online?
                </p>
                <button className="w-full py-2 bg-primary/20 text-primary text-sm font-bold rounded-lg border border-primary/30 hover:bg-primary hover:text-white transition-all duration-200">
                  Pesan di Farmasi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground/60 pt-2 pb-6 gap-2">
        <p>
          Terakhir diperbarui: {formatTanggal(data.tanggal_periksa)} • Klinik
          Sehat Selalu
        </p>
        <div className="flex gap-4">
          <span className="hover:text-primary cursor-pointer transition-colors">
            Kebijakan Privasi
          </span>
          <span className="hover:text-primary cursor-pointer transition-colors">
            Bantuan
          </span>
        </div>
      </div>
    </div>
  );
}
