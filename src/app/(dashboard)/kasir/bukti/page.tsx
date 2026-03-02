"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";

export default function BuktiBayarPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bukti Pembayaran"
        description="Lihat dan cetak ulang bukti pembayaran"
      />
      <EmptyState
        icon={Receipt}
        title="Belum Ada Bukti Bayar"
        description="Bukti pembayaran akan muncul setelah transaksi berhasil diproses."
      />
    </div>
  );
}
