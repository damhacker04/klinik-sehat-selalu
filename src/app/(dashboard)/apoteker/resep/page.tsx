"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill } from "lucide-react";

export default function ApotekerResepPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Resep Masuk"
        description="Proses resep dari dokter dan siapkan obat"
      />
      <EmptyState
        icon={Pill}
        title="Tidak Ada Resep Masuk"
        description="Resep baru dari dokter akan muncul di sini untuk diproses."
      />
    </div>
  );
}
