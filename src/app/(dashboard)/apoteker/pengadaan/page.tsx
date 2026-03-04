"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ShoppingCart, Plus, CheckCircle, Truck, PackageCheck } from "lucide-react";
import { toast } from "sonner";

interface Obat {
  id_obat: number;
  nama_obat: string;
  stok: number;
  satuan: string | null;
}

export default function PengadaanPage() {
  const [data, setData] = useState<any[]>([]);
  const [obatList, setObatList] = useState<Obat[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    id_obat: "",
    jumlah_diminta: "",
    catatan: "",
  });

  async function fetchData() {
    try {
      const res = await fetch("/api/apoteker/pengadaan");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchObat() {
    try {
      const res = await fetch("/api/apoteker/stok");
      if (res.ok) setObatList(await res.json());
    } catch (err) {
      console.error("Failed to fetch obat:", err);
    }
  }

  useEffect(() => {
    fetchData();
    fetchObat();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id_obat || !form.jumlah_diminta) {
      toast.error("Pilih obat dan jumlah wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/apoteker/pengadaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_obat: parseInt(form.id_obat),
          jumlah_diminta: parseInt(form.jumlah_diminta),
          catatan: form.catatan || null,
        }),
      });
      if (res.ok) {
        toast.success("Permintaan pengadaan berhasil dibuat");
        setForm({ id_obat: "", jumlah_diminta: "", catatan: "" });
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat permintaan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id_request: number, status: string) {
    try {
      const res = await fetch("/api/apoteker/pengadaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_request, status }),
      });
      if (res.ok) {
        toast.success(`Status diubah ke ${status}`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mengubah status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

  const nextAction: Record<string, { label: string; next: string; icon: any }> = {
    pending: { label: "Approve", next: "approved", icon: CheckCircle },
    approved: { label: "Order", next: "ordered", icon: Truck },
    ordered: { label: "Terima", next: "received", icon: PackageCheck },
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-emerald-100 text-emerald-700";
      case "ordered":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-violet-100 text-violet-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengadaan Obat"
        description="Kelola permintaan pengadaan obat"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Buat Permintaan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Permintaan Pengadaan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pilih Obat *</Label>
                  <Select
                    value={form.id_obat}
                    onValueChange={(val) =>
                      setForm({ ...form, id_obat: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih obat..." />
                    </SelectTrigger>
                    <SelectContent>
                      {obatList.map((o) => (
                        <SelectItem
                          key={o.id_obat}
                          value={String(o.id_obat)}
                        >
                          {o.nama_obat} (stok: {o.stok}{" "}
                          {o.satuan || "unit"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah Diminta *</Label>
                  <Input
                    id="jumlah"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={form.jumlah_diminta}
                    onChange={(e) =>
                      setForm({ ...form, jumlah_diminta: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan</Label>
                  <Textarea
                    id="catatan"
                    placeholder="Alasan pengadaan..."
                    value={form.catatan}
                    onChange={(e) =>
                      setForm({ ...form, catatan: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Permintaan"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {!loading && data.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Belum Ada Pengadaan"
          description="Permintaan pengadaan obat akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div
              key={item.id_request}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {item.obat?.nama_obat || "Obat"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Jumlah: {item.jumlah_diminta} unit
                </p>
                {item.catatan && (
                  <p className="text-sm text-muted-foreground">
                    Catatan: {item.catatan}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${statusColor(item.status)}`}
                >
                  {item.status}
                </span>
                {nextAction[item.status] && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus(item.id_request, nextAction[item.status].next)
                    }
                  >
                    {(() => {
                      const Icon = nextAction[item.status].icon;
                      return <Icon className="h-3 w-3 mr-1" />;
                    })()}
                    {nextAction[item.status].label}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
