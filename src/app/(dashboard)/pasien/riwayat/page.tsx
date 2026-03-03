"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

export default function RiwayatMedisPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRiwayat() {
      try {
        const res = await fetch("/api/pasien/riwayat");
        if (res.ok) {
          const data = await res.json();
          setRiwayat(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch riwayat:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRiwayat();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Riwayat Medis"
        description="Lihat riwayat kunjungan dan pemeriksaan Anda"
      />

      {!loading && riwayat.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum Ada Riwayat"
          description="Riwayat medis Anda akan muncul di sini setelah melakukan kunjungan ke klinik."
        />
      ) : (
        <div className="space-y-4">
          {riwayat.map((item: any) => (
            <div key={item.id_rekam} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {new Date(item.tanggal_periksa).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                {item.tekanan_darah && <p>Tekanan Darah: {item.tekanan_darah}</p>}
                {item.suhu && <p>Suhu: {item.suhu}°C</p>}
                {item.berat_badan && <p>Berat Badan: {item.berat_badan} kg</p>}
                {item.diagnosa && (
                  <p className="text-foreground font-medium">Diagnosa: {item.diagnosa}</p>
                )}
                {item.catatan && <p>Catatan: {item.catatan}</p>}
                {item.rujukan && <p>Rujukan: {item.rujukan}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
