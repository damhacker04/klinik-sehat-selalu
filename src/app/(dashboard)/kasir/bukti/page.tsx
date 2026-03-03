"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";

export default function KasirBuktiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/kasir/bukti");
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
      <PageHeader title="Bukti Pembayaran" description="Cetak dan kelola bukti pembayaran pasien" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Receipt} title="Belum Ada Bukti" description="Bukti pembayaran akan muncul setelah ada transaksi selesai." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_transaksi} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">#{item.id_transaksi} — {item.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground">{item.tanggal_bayar ? new Date(item.tanggal_bayar).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatRupiah(item.total_biaya)}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
