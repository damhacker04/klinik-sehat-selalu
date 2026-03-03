"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/pasien/notifikasi");
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifikasi"
        description="Pemberitahuan antrian, resep, dan pengingat kontrol"
      />

      {!loading && notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum Ada Notifikasi"
          description="Notifikasi tentang antrian, resep, dan pengingat kontrol akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif: any) => (
            <div key={notif.id} className="flex items-start gap-3 rounded-lg border p-4">
              <Bell className="h-5 w-5 mt-0.5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notif.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${notif.status === "sent"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
                }`}>
                {notif.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
