"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill } from "lucide-react";

export default function DokterResepPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dokter/resep");
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
      <PageHeader title="Daftar Resep" description="Resep yang telah Anda buat" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Pill} title="Belum Ada Resep" description="Resep yang telah Anda buat akan muncul di sini." />
      ) : (
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item.id_resep} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{item.rekam_medis?.pasien?.nama || "Pasien"}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : item.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
              </div>
              <div className="space-y-1">
                {(item.detail_resep || []).map((d: any, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">• {d.obat?.nama_obat || "Obat"} — {d.jumlah} unit {d.dosis ? `(${d.dosis})` : ""}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
