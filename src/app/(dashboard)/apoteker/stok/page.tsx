"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";

interface ObatRow {
  id_obat: number;
  nama_obat: string;
  stok: number;
  harga: number;
  satuan: string | null;
  stok_minimum: number;
  [key: string]: unknown;
}

export default function StokObatPage() {
  const [data, setData] = useState<ObatRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/apoteker/stok");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch stok:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const columns: Column<ObatRow>[] = [
    { key: "nama_obat", header: "Nama Obat", cell: (row) => <span className="font-medium">{row.nama_obat}</span> },
    {
      key: "stok", header: "Stok", cell: (row) => (
        <span className={row.stok <= row.stok_minimum ? "text-red-600 font-medium" : ""}>
          {row.stok} {row.satuan || "unit"}
        </span>
      )
    },
    { key: "harga", header: "Harga", cell: (row) => <span>{formatRupiah(row.harga)}</span> },
    { key: "stok_minimum", header: "Min. Stok", cell: (row) => <span>{row.stok_minimum}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Stok Obat" description="Kelola inventori obat klinik"
        action={<Button><Plus className="h-4 w-4 mr-2" /> Tambah Obat</Button>}
      />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Package} title="Belum Ada Data Obat" description="Tambahkan data obat untuk mulai mengelola inventori." />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Cari obat..." searchKey="nama_obat" />
      )}
    </div>
  );
}
