"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle } from "lucide-react";

export default function StokMenipisPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Stok Menipis"
        description="Obat dengan stok di bawah batas minimum"
      />
      <EmptyState
        icon={AlertTriangle}
        title="Semua Stok Aman"
        description="Tidak ada obat dengan stok menipis. Semua stok di atas batas minimum."
      />
    </div>
  );
}
