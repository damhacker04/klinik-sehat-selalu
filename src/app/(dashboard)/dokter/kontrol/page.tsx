"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";

export default function DokterKontrolPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Kontrol Lanjutan" description="Daftar pasien yang perlu kontrol lanjutan" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Tidak Ada Kontrol" description="Daftar pasien yang perlu kontrol lanjutan akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_reminder} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{item.rekam_medis?.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground">Diagnosa: {item.rekam_medis?.diagnosa || "-"}</p>
                <p className="text-sm text-muted-foreground">Tanggal kontrol: {new Date(item.tanggal_kontrol).toLocaleDateString("id-ID")}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
