"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function RiwayatTransaksiPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Riwayat Transaksi"
        description="Lihat riwayat semua transaksi pembayaran"
      />
      <EmptyState
        icon={FileText}
        title="Belum Ada Riwayat"
        description="Riwayat transaksi akan muncul setelah ada pembayaran yang diproses."
      />
    </div>
  );
}
