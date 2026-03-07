"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function DokterRekamMedisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dokter/rekam-medis");
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
      <PageHeader title="Rekam Medis" description="Riwayat rekam medis pasien yang Anda tangani" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={FileText} title="Belum Ada Rekam Medis" description="Rekam medis pasien yang Anda tangani akan muncul di sini." />
      ) : (
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item.id_rekam} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                <span className="text-sm text-muted-foreground">{new Date(item.tanggal_periksa).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="grid gap-1 text-sm text-muted-foreground">
                {item.tekanan_darah && <p>TD: {item.tekanan_darah}</p>}
                {item.diagnosa && <p className="text-foreground font-medium">Diagnosa: {item.diagnosa}</p>}
                {item.catatan && <p>Catatan: {item.catatan}</p>}
                {item.rujukan && <p className="text-red-500 font-medium">Rujukan: {item.rujukan}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
