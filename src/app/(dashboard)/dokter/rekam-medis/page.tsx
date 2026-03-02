"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function RekamMedisPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rekam Medis"
        description="Riwayat rekam medis seluruh pasien"
      />
      <EmptyState
        icon={FileText}
        title="Belum Ada Rekam Medis"
        description="Rekam medis pasien akan muncul setelah pemeriksaan dilakukan."
      />
    </div>
  );
}
