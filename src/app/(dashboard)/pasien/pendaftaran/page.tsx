"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  formPendaftaranSchema,
  type FormPendaftaranInput,
} from "@/lib/validations/patient";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ClipboardList, CheckCircle2, History } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function PendaftaranPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const form = useForm<FormPendaftaranInput>({
    resolver: zodResolver(formPendaftaranSchema),
    defaultValues: {
      keluhan: "",
      permintaan_khusus: "",
    },
  });

  async function fetchRiwayat() {
    try {
      const res = await fetch("/api/pasien/pendaftaran");
      if (res.ok) {
        const data = await res.json();
        setRiwayat(data || []);
      }
    } catch (error) {
      console.error("Gagal mendownload riwayat:", error);
    } finally {
      setLoadingRiwayat(false);
    }
  }

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function onSubmit(data: FormPendaftaranInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/pasien/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal mengirim pendaftaran");
        return;
      }

      toast.success("Pendaftaran berhasil dikirim!");
      setSubmitted(true);
      fetchRiwayat(); // Refresh history
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Pendaftaran" description="Form pendaftaran kunjungan" />
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold">Pendaftaran Terkirim!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Form pendaftaran Anda sedang menunggu verifikasi oleh admin.
              Anda akan mendapat notifikasi setelah diverifikasi.
            </p>
            <div className="mt-4">
              <StatusBadge status="pending" />
            </div>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSubmitted(false);
                form.reset();
              }}
            >
              Daftar Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pendaftaran Kunjungan"
        description="Isi form berikut untuk mendaftar kunjungan ke klinik"
      />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Kolom Kiri: Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Form Pendaftaran Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="keluhan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keluhan Utama *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan keluhan atau gejala yang Anda rasakan..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="permintaan_khusus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permintaan Khusus (opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Misalnya: ingin ditangani dokter tertentu, alergi obat tertentu, dll."
                          className="min-h-[80px] resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? "Mengirim..." : "Kirim Pendaftaran"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Riwayat */}
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-blue-500" />
              Riwayat Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRiwayat ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Memuat riwayat...
              </div>
            ) : riwayat.length === 0 ? (
              <EmptyState title="Belum Ada Riwayat" description="Anda belum membuat pendaftaran apapun." icon={History} />
            ) : (
              <div className="space-y-4">
                {riwayat.map((item) => (
                  <div key={item.id_form} className="flex flex-col sm:flex-row sm:items-start justify-between rounded-lg border p-4 gap-4">
                    <div>
                      <p className="font-semibold">{new Date(item.tanggal_daftar).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.keluhan}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
