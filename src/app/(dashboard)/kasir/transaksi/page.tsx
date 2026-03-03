"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TransaksiRow {
  id_transaksi: number;
  nama_pasien: string;
  total_biaya: number;
  metode_pembayaran: string;
  status: string;
  tanggal_bayar: string | null;
  [key: string]: unknown;
}

interface ItemRow {
  keterangan: string;
  biaya: string;
}

export default function KasirTransaksiPage() {
  const [data, setData] = useState<TransaksiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [form, setForm] = useState({
    id_pasien: "",
    metode_pembayaran: "",
  });
  const [items, setItems] = useState<ItemRow[]>([
    { keterangan: "", biaya: "" },
  ]);

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

  async function fetchPasien() {
    try {
      const res = await fetch("/api/admin/pengguna");
      if (res.ok) {
        const users = await res.json();
        setPasienList(users.filter((u: any) => u.role === "pasien"));
      }
    } catch (err) {
      console.error("Failed to fetch pasien:", err);
    }
  }

  useEffect(() => {
    fetchData();
    fetchPasien();
  }, []);

  function addItem() {
    setItems([...items, { keterangan: "", biaya: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof ItemRow, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  }

  const totalBiaya = items.reduce(
    (sum, item) => sum + (parseInt(item.biaya) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id_pasien) {
      toast.error("Pilih pasien terlebih dahulu");
      return;
    }
    const validItems = items.filter((i) => i.keterangan && i.biaya);
    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 item transaksi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kasir/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pasien: parseInt(form.id_pasien),
          items: validItems.map((i) => ({
            keterangan: i.keterangan,
            biaya: parseInt(i.biaya),
          })),
          metode_pembayaran: form.metode_pembayaran || null,
        }),
      });
      if (res.ok) {
        toast.success("Transaksi berhasil dibuat");
        setForm({ id_pasien: "", metode_pembayaran: "" });
        setItems([{ keterangan: "", biaya: "" }]);
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat transaksi");
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

  const columns: Column<TransaksiRow>[] = [
    {
      key: "id_transaksi",
      header: "ID",
      cell: (row) => (
        <span className="font-mono text-sm">#{row.id_transaksi}</span>
      ),
    },
    {
      key: "nama_pasien",
      header: "Pasien",
      cell: (row) => <span className="font-medium">{row.nama_pasien}</span>,
    },
    {
      key: "total_biaya",
      header: "Total",
      cell: (row) => <span>{formatRupiah(row.total_biaya)}</span>,
    },
    {
      key: "metode_pembayaran",
      header: "Metode",
      cell: (row) => (
        <span className="capitalize">{row.metode_pembayaran}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status as any} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Transaksi"
        description="Kelola transaksi pembayaran pasien"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Transaksi Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Buat Transaksi Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pasien *</Label>
                  <Select
                    value={form.id_pasien}
                    onValueChange={(val) =>
                      setForm({ ...form, id_pasien: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasien..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pasienList.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Item Transaksi *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Tambah Item
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Keterangan"
                          value={item.keterangan}
                          onChange={(e) =>
                            updateItem(idx, "keterangan", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Biaya"
                          type="number"
                          min="0"
                          value={item.biaya}
                          onChange={(e) =>
                            updateItem(idx, "biaya", e.target.value)
                          }
                          className="w-28"
                        />
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => removeItem(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={form.metode_pembayaran}
                    onValueChange={(val) =>
                      setForm({ ...form, metode_pembayaran: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode (opsional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunai">Tunai</SelectItem>
                      <SelectItem value="kartu">Kartu</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk menyimpan sebagai draft
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">
                    {formatRupiah(totalBiaya)}
                  </span>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting
                    ? "Memproses..."
                    : form.metode_pembayaran
                      ? "Bayar & Simpan"
                      : "Simpan Draft"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {!loading && data.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Belum Ada Transaksi"
          description="Transaksi pembayaran akan muncul di sini."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari pasien..."
          searchKey="nama_pasien"
        />
      )}
    </div>
  );
}
