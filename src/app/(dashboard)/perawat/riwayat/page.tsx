"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock } from "lucide-react";

export default function PerawatRiwayatPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/perawat/pemeriksaan");
        if (res.ok) {
          const result = await res.json();
          setData(Array.isArray(result) ? result : []);
        }
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
      <PageHeader title="Riwayat Pemeriksaan" description="Riwayat pemeriksaan awal yang telah Anda lakukan" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Clock} title="Belum Ada Riwayat" description="Riwayat pemeriksaan yang telah Anda lakukan akan muncul di sini." />
      ) : (
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item.id_rekam} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                <span className="text-sm text-muted-foreground">{new Date(item.tanggal_periksa).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="grid gap-1 text-sm text-muted-foreground">
                <p>TD: {item.tekanan_darah || "-"} | Suhu: {item.suhu || "-"}°C | BB: {item.berat_badan || "-"} kg</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
