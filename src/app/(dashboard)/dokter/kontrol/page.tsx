"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";

export default function KontrolPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Kontrol Lanjutan"
        description="Kelola jadwal kontrol dan reminder pasien"
      />
      <EmptyState
        icon={CalendarCheck}
        title="Belum Ada Jadwal Kontrol"
        description="Pasien yang dijadwalkan kontrol lanjutan akan muncul di sini."
      />
    </div>
  );
}
