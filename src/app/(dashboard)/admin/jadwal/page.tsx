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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

interface JadwalRow {
  id: number;
  nama: string;
  role: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  [key: string]: unknown;
}

const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function JadwalPage() {
  const [data, setData] = useState<JadwalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [form, setForm] = useState({
    staffType: "dokter" as "dokter" | "perawat",
    staffId: "",
    hari: "",
    jam_mulai: "",
    jam_selesai: "",
  });

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/jadwal");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch jadwal:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStaff() {
    try {
      const res = await fetch("/api/admin/pengguna");
      if (res.ok) {
        const users = await res.json();
        setStaffList(
          users.filter((u: any) => u.role === "dokter" || u.role === "perawat")
        );
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hari || !form.jam_mulai || !form.jam_selesai) {
      toast.error("Hari, jam mulai, dan jam selesai wajib");
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        hari: form.hari,
        jam_mulai: form.jam_mulai,
        jam_selesai: form.jam_selesai,
      };
      if (form.staffId) {
        if (form.staffType === "dokter") {
          body.id_dokter = parseInt(form.staffId);
        } else {
          body.id_perawat = parseInt(form.staffId);
        }
      }

      const res = await fetch("/api/admin/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Jadwal berhasil ditambahkan");
        setForm({ staffType: "dokter", staffId: "", hari: "", jam_mulai: "", jam_selesai: "" });
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambahkan jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const res = await fetch(`/api/admin/jadwal?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Jadwal berhasil dihapus");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

  const columns: Column<JadwalRow>[] = [
    {
      key: "nama",
      header: "Nama",
      cell: (row) => <span className="font-medium">{row.nama}</span>,
    },
    {
      key: "role",
      header: "Peran",
      cell: (row) => <span className="text-sm capitalize">{row.role}</span>,
    },
    {
      key: "hari",
      header: "Hari",
      cell: (row) => <span className="text-sm">{row.hari}</span>,
    },
    {
      key: "jam",
      header: "Jam",
      cell: (row) => (
        <span className="text-sm">
          {row.jam_mulai} - {row.jam_selesai}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => handleDelete(row.id)}
        >
          Hapus
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Jadwal Dokter & Perawat"
        description="Kelola jadwal praktik tenaga medis"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipe Staff</Label>
                  <Select
                    value={form.staffType}
                    onValueChange={(val: "dokter" | "perawat") =>
                      setForm({ ...form, staffType: val, staffId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dokter">Dokter</SelectItem>
                      <SelectItem value="perawat">Perawat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hari *</Label>
                  <Select
                    value={form.hari}
                    onValueChange={(val) => setForm({ ...form, hari: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hari..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hariOptions.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jam_mulai">Jam Mulai *</Label>
                    <Input
                      id="jam_mulai"
                      type="time"
                      value={form.jam_mulai}
                      onChange={(e) =>
                        setForm({ ...form, jam_mulai: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jam_selesai">Jam Selesai *</Label>
                    <Input
                      id="jam_selesai"
                      type="time"
                      value={form.jam_selesai}
                      onChange={(e) =>
                        setForm({ ...form, jam_selesai: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Jadwal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {!loading && data.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Belum Ada Jadwal"
          description="Tambahkan jadwal praktik dokter dan perawat."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari nama..."
          searchKey="nama"
        />
      )}
    </div>
  );
}
