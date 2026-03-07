"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";

export default function DokterPemeriksaanPage() {
  const [antrian, setAntrian] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [diagnosa, setDiagnosa] = useState("");
  const [catatan, setCatatan] = useState("");
  const [rujukan, setRujukan] = useState("");
  const [kontrolLanjutan, setKontrolLanjutan] = useState(false);

  useEffect(() => {
    fetchAntrian();
  }, []);

  async function fetchAntrian() {
    try {
      const res = await fetch("/api/dokter/antrian");
      if (res.ok) {
        const data = await res.json();
        setAntrian(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedPatient || !diagnosa) {
      toast.error("Diagnosa wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dokter/pemeriksaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rekam: selectedPatient.id_rekam,
          diagnosa,
          catatan: catatan || null,
          rujukan: rujukan || null,
          kontrol_lanjutan: kontrolLanjutan,
        }),
      });
      if (res.ok) {
        toast.success("Diagnosis berhasil disimpan!");
        setSelectedPatient(null);
        setDiagnosa("");
        setCatatan("");
        setRujukan("");
        setKontrolLanjutan(false);
        fetchAntrian();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  if (selectedPatient) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Pemeriksaan Dokter" description={`Pasien: ${selectedPatient.pasien?.nama || "Pasien"}`} />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-500" />
              Input Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1 text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50">
              <p><span className="font-medium text-foreground">Keluhan: </span>{selectedPatient.keluhan || "-"}</p>
              <div className="border-t border-muted-foreground/20 my-2"></div>
              <p>TD: {selectedPatient.tekanan_darah || "-"}</p>
              <p>Suhu: {selectedPatient.suhu || "-"}°C</p>
              <p>BB: {selectedPatient.berat_badan || "-"} kg</p>
            </div>
            <div>
              <label className="text-sm font-medium">Diagnosa *</label>
              <Textarea value={diagnosa} onChange={(e) => setDiagnosa(e.target.value)} placeholder="Masukkan diagnosa..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Catatan</label>
              <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan tambahan..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Rujukan</label>
              <Input value={rujukan} onChange={(e) => setRujukan(e.target.value)} placeholder="Rujukan (jika ada)" className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="kontrol" checked={kontrolLanjutan} onChange={(e) => setKontrolLanjutan(e.target.checked)} />
              <label htmlFor="kontrol" className="text-sm">Perlu kontrol lanjutan</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan Diagnosis"}</Button>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Pemeriksaan Dokter" description="Periksa pasien dan input diagnosis" />
      {!loading && antrian.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Tidak Ada Pasien Menunggu" description="Pasien yang sudah diperiksa perawat akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {antrian.map((item: any) => (
            <div key={item.id_rekam} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">Keluhan:</span> {item.keluhan || "-"}</p>
                <p className="text-xs text-muted-foreground/80">TD: {item.tekanan_darah || "-"} | Suhu: {item.suhu || "-"}°C | BB: {item.berat_badan || "-"} kg</p>
              </div>
              <Button size="sm" onClick={() => setSelectedPatient(item)}>Periksa</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
