"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function PerawatCatatanPage() {
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
      <PageHeader title="Catatan Perawat" description="Catatan pemeriksaan awal pasien" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={FileText} title="Belum Ada Catatan" description="Catatan pemeriksaan awal akan muncul di sini setelah Anda memeriksa pasien." />
      ) : (
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item.id_rekam} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                <span className="text-sm text-muted-foreground">{new Date(item.tanggal_periksa).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="grid gap-1 text-sm text-muted-foreground">
                {item.tekanan_darah && <p>Tekanan Darah: {item.tekanan_darah}</p>}
                {item.suhu && <p>Suhu: {item.suhu}°C</p>}
                {item.berat_badan && <p>Berat Badan: {item.berat_badan} kg</p>}
                {item.catatan && <p>Catatan: {item.catatan}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
