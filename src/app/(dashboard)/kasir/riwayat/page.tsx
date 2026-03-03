"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock } from "lucide-react";

export default function KasirRiwayatPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/kasir/riwayat");
        if (res.ok) setData(await res.json());
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
      <PageHeader title="Riwayat Pembayaran" description="Riwayat transaksi yang sudah selesai" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Clock} title="Belum Ada Riwayat" description="Riwayat pembayaran akan muncul setelah ada transaksi yang selesai." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_transaksi} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground">{item.tanggal_bayar ? new Date(item.tanggal_bayar).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatRupiah(item.total_biaya)}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.metode_pembayaran || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
