"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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
import { Pill, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ResepItem {
  id_obat: string;
  jumlah: string;
  dosis: string;
}

export default function DokterResepPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rekamList, setRekamList] = useState<any[]>([]);
  const [obatList, setObatList] = useState<any[]>([]);
  const [selectedRekam, setSelectedRekam] = useState("");
  const [items, setItems] = useState<ResepItem[]>([
    { id_obat: "", jumlah: "1", dosis: "" },
  ]);

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

  async function fetchRekamMedis() {
    try {
      const res = await fetch("/api/dokter/rekam-medis");
      if (res.ok) setRekamList(await res.json());
    } catch (err) {
      console.error("Failed to fetch rekam medis:", err);
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
    fetchRekamMedis();
    fetchObat();
  }, []);

  function addItem() {
    setItems([...items, { id_obat: "", jumlah: "1", dosis: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof ResepItem, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRekam) {
      toast.error("Pilih pasien/rekam medis terlebih dahulu");
      return;
    }
    const validItems = items.filter((i) => i.id_obat && i.jumlah);
    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 obat");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dokter/resep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rekam: parseInt(selectedRekam),
          items: validItems.map((i) => ({
            id_obat: parseInt(i.id_obat),
            jumlah: parseInt(i.jumlah),
            dosis: i.dosis || null,
          })),
        }),
      });
      if (res.ok) {
        toast.success("Resep berhasil dibuat");
        setSelectedRekam("");
        setItems([{ id_obat: "", jumlah: "1", dosis: "" }]);
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat resep");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Daftar Resep"
        description="Resep yang telah Anda buat"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Buat Resep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Buat Resep Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Pasien (Rekam Medis) *</Label>
                  <Select
                    value={selectedRekam}
                    onValueChange={setSelectedRekam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasien..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rekamList.map((r: any) => (
                        <SelectItem
                          key={r.id_rekam}
                          value={String(r.id_rekam)}
                        >
                          {r.pasien?.nama || "Pasien"} — {r.diagnosa || "Belum didiagnosa"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Obat *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Tambah Obat
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="space-y-2 p-3 rounded-lg border">
                        <div className="flex gap-2 items-center">
                          <Select
                            value={item.id_obat}
                            onValueChange={(val) =>
                              updateItem(idx, "id_obat", val)
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Pilih obat..." />
                            </SelectTrigger>
                            <SelectContent>
                              {obatList.map((o: any) => (
                                <SelectItem
                                  key={o.id_obat}
                                  value={String(o.id_obat)}
                                >
                                  {o.nama_obat} - {o.satuan || "Unit"} (stok: {o.stok})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Jumlah"
                            value={item.jumlah}
                            onChange={(e) =>
                              updateItem(idx, "jumlah", e.target.value)
                            }
                            className="w-24"
                          />
                          <Input
                            placeholder="Dosis (mis: 3x1 sehari)"
                            value={item.dosis}
                            onChange={(e) =>
                              updateItem(idx, "dosis", e.target.value)
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Memproses..." : "Buat Resep"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {!loading && data.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Belum Ada Resep"
          description="Resep yang telah Anda buat akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item.id_resep} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">
                  {item.rekam_medis?.pasien?.nama || "Pasien"}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-emerald-100 text-emerald-700" : item.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="space-y-1">
                {(item.detail_resep || []).map((d: any, i: number) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground"
                  >
                    • {d.obat?.nama_obat || "Obat"} — {d.jumlah} unit{" "}
                    {d.dosis ? `(${d.dosis})` : ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
