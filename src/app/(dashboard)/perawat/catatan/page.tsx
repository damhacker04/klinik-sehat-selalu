"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StickyNote } from "lucide-react";

export default function CatatanPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Catatan Pemeriksaan"
        description="Catatan dan notasi pemeriksaan awal"
      />
      <EmptyState
        icon={StickyNote}
        title="Belum Ada Catatan"
        description="Catatan pemeriksaan akan muncul setelah melakukan pemeriksaan awal."
      />
    </div>
  );
}
