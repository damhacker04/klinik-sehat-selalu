"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ReminderItem {
  id_reminder: number;
  tanggal_kontrol: string;
  status: string;
  rekam_medis?: {
    pasien?: { nama: string } | null;
    diagnosa: string | null;
  } | null;
}

export default function DokterKontrolPage() {
  const [data, setData] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/dokter/kontrol");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function updateStatus(id_reminder: number, status: string) {
    try {
      const res = await fetch("/api/dokter/kontrol", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reminder, status }),
      });
      if (res.ok) {
        toast.success(
          status === "sent"
            ? "Pengingat terkirim ke pasien"
            : "Kontrol ditandai selesai"
        );
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mengubah status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "sent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Kontrol Lanjutan" description="Daftar pasien yang perlu kontrol lanjutan" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Tidak Ada Kontrol" description="Daftar pasien yang perlu kontrol lanjutan akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.id_reminder} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{item.rekam_medis?.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground">Diagnosa: {item.rekam_medis?.diagnosa || "-"}</p>
                <p className="text-sm text-muted-foreground">Tanggal kontrol: {new Date(item.tanggal_kontrol).toLocaleDateString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(item.status)}`}>
                  {item.status}
                </span>
                {item.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(item.id_reminder, "sent")}
                  >
                    <Send className="h-3 w-3 mr-1" /> Kirim Pengingat
                  </Button>
                )}
                {item.status === "sent" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(item.id_reminder, "completed")}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Selesai
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

