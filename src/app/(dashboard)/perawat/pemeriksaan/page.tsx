"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vitalSignsSchema, type VitalSignsInput } from "@/lib/validations/medical";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Activity, Thermometer, Weight, HeartPulse } from "lucide-react";

export default function PemeriksaanPage() {
  const [loading, setLoading] = useState(false);
  const [antrian, setAntrian] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    async function fetchAntrian() {
      try {
        const res = await fetch("/api/perawat/antrian");
        if (res.ok) {
          const data = await res.json();
          setAntrian(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch antrian:", err);
      }
    }
    fetchAntrian();
  }, []);

  const form = useForm<VitalSignsInput>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {
      tekanan_darah: "",
      suhu: undefined,
      berat_badan: undefined,
      catatan: "",
    },
  });

  async function onSubmit(data: VitalSignsInput) {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const res = await fetch("/api/perawat/pemeriksaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pasien: selectedPatient.form_pendaftaran?.id_pasien || null,
          id_antrian: selectedPatient.id_antrian,
          ...data,
        }),
      });
      if (res.ok) {
        toast.success("Data vital signs berhasil disimpan!");
        form.reset();
        setSelectedPatient(null);
        // Refresh antrian
        const antrianRes = await fetch("/api/perawat/antrian");
        if (antrianRes.ok) setAntrian(await antrianRes.json());
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (!selectedPatient) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Pemeriksaan Awal" description="Input data vital signs pasien" />
        {antrian.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Tidak Ada Pasien"
            description="Ambil pasien dari antrian untuk memulai pemeriksaan awal."
          />
        ) : (
          <div className="space-y-3">
            {antrian.map((item: any) => (
              <div key={item.id_antrian} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">#{item.nomor_antrian} — {item.form_pendaftaran?.pasien?.nama || "Pasien"}</p>
                  <p className="text-sm text-muted-foreground">Keluhan: {item.form_pendaftaran?.keluhan || "-"}</p>
                </div>
                <Button size="sm" onClick={() => setSelectedPatient(item)}>Periksa</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Pemeriksaan Awal" description={`Pasien: ${selectedPatient.form_pendaftaran?.pasien?.nama || "Pasien"}`} />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-emerald-500" />
            Input Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField control={form.control} name="tekanan_darah" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><HeartPulse className="h-3.5 w-3.5 text-red-500" /> Tekanan Darah</FormLabel>
                    <FormControl><Input placeholder="120/80" className="h-11" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="suhu" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-orange-500" /> Suhu (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="36.5" className="h-11" {...field} value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="berat_badan" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Weight className="h-3.5 w-3.5 text-blue-500" /> Berat Badan (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="65.0" className="h-11" {...field} value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="catatan" render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan pemeriksaan awal..." className="min-h-[100px] resize-none" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan & Kirim ke Dokter"}</Button>
                <Button type="button" variant="outline" onClick={() => setSelectedPatient(null)}>Batal</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
