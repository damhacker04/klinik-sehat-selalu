"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";

export default function NotifikasiPage() {
  // TODO: Fetch from Supabase notifications
  const notifications: unknown[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifikasi"
        description="Pemberitahuan antrian, resep, dan pengingat kontrol"
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum Ada Notifikasi"
          description="Notifikasi tentang antrian, resep, dan pengingat kontrol akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {/* TODO: List notifications with mark as read */}
        </div>
      )}
    </div>
  );
}
