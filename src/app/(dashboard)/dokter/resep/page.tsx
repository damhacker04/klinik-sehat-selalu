"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill } from "lucide-react";

export default function ResepPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Resep & Rujukan"
        description="Buat resep obat dan surat rujukan"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-blue-600" />
              Buat Resep Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Pill}
              title="Pilih Pasien Terlebih Dahulu"
              description="Pilih pasien dari pemeriksaan untuk membuat resep obat."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Resep</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Pill}
              title="Belum Ada Resep"
              description="Resep yang sudah dibuat akan muncul di sini."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
