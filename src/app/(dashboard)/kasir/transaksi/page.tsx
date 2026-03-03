"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreditCard } from "lucide-react";

interface TransaksiRow {
  id_transaksi: number;
  nama_pasien: string;
  total_biaya: number;
  metode_pembayaran: string;
  status: string;
  tanggal_bayar: string | null;
  [key: string]: unknown;
}

export default function KasirTransaksiPage() {
  const [data, setData] = useState<TransaksiRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/kasir/transaksi");
        if (res.ok) {
          const raw = await res.json();
          setData(
            (Array.isArray(raw) ? raw : []).map((t: any) => ({
              id_transaksi: t.id_transaksi,
              nama_pasien: t.pasien?.nama || "Pasien",
              total_biaya: t.total_biaya,
              metode_pembayaran: t.metode_pembayaran || "-",
              status: t.status,
              tanggal_bayar: t.tanggal_bayar,
            }))
          );
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

  const columns: Column<TransaksiRow>[] = [
    { key: "id_transaksi", header: "ID", cell: (row) => <span className="font-mono text-sm">#{row.id_transaksi}</span> },
    { key: "nama_pasien", header: "Pasien", cell: (row) => <span className="font-medium">{row.nama_pasien}</span> },
    { key: "total_biaya", header: "Total", cell: (row) => <span>{formatRupiah(row.total_biaya)}</span> },
    { key: "metode_pembayaran", header: "Metode", cell: (row) => <span className="capitalize">{row.metode_pembayaran}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transaksi" description="Kelola transaksi pembayaran pasien" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={CreditCard} title="Belum Ada Transaksi" description="Transaksi pembayaran akan muncul di sini." />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Cari pasien..." searchKey="nama_pasien" />
      )}
    </div>
  );
}
