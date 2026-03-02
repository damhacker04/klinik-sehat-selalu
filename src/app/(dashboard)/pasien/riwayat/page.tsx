"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function RiwayatMedisPage() {
  // TODO: Fetch from Supabase rekam_medis
  const riwayat: unknown[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Riwayat Medis"
        description="Lihat riwayat kunjungan dan pemeriksaan Anda"
      />

      {riwayat.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum Ada Riwayat"
          description="Riwayat medis Anda akan muncul di sini setelah melakukan kunjungan ke klinik."
        />
      ) : (
        <div className="space-y-4">
          {/* TODO: List riwayat medis with timeline view */}
        </div>
      )}
    </div>
  );
}
