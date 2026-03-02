"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diagnosisSchema, type DiagnosisInput } from "@/lib/validations/medical";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Stethoscope } from "lucide-react";

export default function DokterPemeriksaanPage() {
  const [loading, setLoading] = useState(false);
  const currentPatient = null;

  const form = useForm<DiagnosisInput>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      diagnosa: "",
      rujukan: "",
      kontrol_lanjutan: false,
    },
  });

  async function onSubmit(data: DiagnosisInput) {
    setLoading(true);
    console.log("Diagnosis:", data);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Diagnosis berhasil disimpan!");
    form.reset();
    setLoading(false);
  }

  if (!currentPatient) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Pemeriksaan Pasien"
          description="Lakukan diagnosis dan buat resep"
        />
        <EmptyState
          icon={Stethoscope}
          title="Tidak Ada Pasien"
          description="Ambil pasien dari antrian yang sudah diperiksa perawat."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pemeriksaan Pasien"
        description="Lakukan diagnosis dan buat resep"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Form Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="diagnosa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan hasil diagnosis..."
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
                name="rujukan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rujukan (opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama rumah sakit / spesialis rujukan"
                        className="h-11"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Diagnosis"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
