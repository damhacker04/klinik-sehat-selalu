"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function PerawatRiwayatPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Riwayat Pasien"
        description="Lihat pasien yang sudah diperiksa hari ini"
      />
      <EmptyState
        icon={FileText}
        title="Belum Ada Riwayat"
        description="Riwayat pemeriksaan hari ini akan muncul di sini."
      />
    </div>
  );
}
