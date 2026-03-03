"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle } from "lucide-react";

export default function StokMenipisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/apoteker/stok");
        if (res.ok) {
          const all = await res.json();
          // Filter only items where stok <= stok_minimum
          setData(all.filter((item: any) => item.stok <= item.stok_minimum));
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Stok Menipis" description="Obat yang stoknya di bawah batas minimum" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Tidak Ada Stok Menipis" description="Semua obat memiliki stok yang cukup." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_obat} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 p-4">
              <div>
                <p className="font-medium">{item.nama_obat}</p>
                <p className="text-sm text-muted-foreground">Harga: {formatRupiah(item.harga)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{item.stok} {item.satuan || "unit"}</p>
                <p className="text-xs text-muted-foreground">Min: {item.stok_minimum}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
