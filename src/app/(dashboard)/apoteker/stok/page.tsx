"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama_obat: "",
    stok: "",
    harga: "",
    satuan: "",
    stok_minimum: "10",
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_obat || !form.stok || !form.harga) {
      toast.error("Nama obat, stok, dan harga wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/apoteker/stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_obat: form.nama_obat,
          stok: parseInt(form.stok),
          harga: parseInt(form.harga),
          satuan: form.satuan || "tablet",
          stok_minimum: parseInt(form.stok_minimum) || 10,
        }),
      });
      if (res.ok) {
        toast.success("Obat berhasil ditambahkan");
        setForm({ nama_obat: "", stok: "", harga: "", satuan: "", stok_minimum: "10" });
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambahkan obat");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const columns: Column<ObatRow>[] = [
    {
      key: "nama_obat",
      header: "Nama Obat",
      cell: (row) => <span className="font-medium">{row.nama_obat}</span>,
    },
    {
      key: "stok",
      header: "Stok",
      cell: (row) => (
        <span
          className={
            row.stok <= row.stok_minimum ? "text-red-600 font-medium" : ""
          }
        >
          {row.stok} {row.satuan || "unit"}
        </span>
      ),
    },
    {
      key: "harga",
      header: "Harga",
      cell: (row) => <span>{formatRupiah(row.harga)}</span>,
    },
    {
      key: "stok_minimum",
      header: "Min. Stok",
      cell: (row) => <span>{row.stok_minimum}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Stok Obat"
        description="Kelola inventori obat klinik"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Tambah Obat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Obat Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_obat">Nama Obat *</Label>
                  <Input
                    id="nama_obat"
                    placeholder="Contoh: Paracetamol 500mg"
                    value={form.nama_obat}
                    onChange={(e) =>
                      setForm({ ...form, nama_obat: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stok">Stok Awal *</Label>
                    <Input
                      id="stok"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={form.stok}
                      onChange={(e) =>
                        setForm({ ...form, stok: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan">Satuan</Label>
                    <Input
                      id="satuan"
                      placeholder="tablet"
                      value={form.satuan}
                      onChange={(e) =>
                        setForm({ ...form, satuan: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="harga">Harga (Rp) *</Label>
                    <Input
                      id="harga"
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={form.harga}
                      onChange={(e) =>
                        setForm({ ...form, harga: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stok_minimum">Stok Minimum</Label>
                    <Input
                      id="stok_minimum"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={form.stok_minimum}
                      onChange={(e) =>
                        setForm({ ...form, stok_minimum: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Obat"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {!loading && data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum Ada Data Obat"
          description="Tambahkan data obat untuk mulai mengelola inventori."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari obat..."
          searchKey="nama_obat"
        />
      )}
    </div>
  );
}
