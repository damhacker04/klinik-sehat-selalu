"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
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

export default function JadwalPage() {
  const [data, setData] = useState<JadwalRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete(id: number) {
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
      cell: (row) => (
        <span className="text-sm capitalize">{row.role}</span>
      ),
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleDelete(row.id)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Jadwal Dokter & Perawat"
        description="Kelola jadwal praktik tenaga medis"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jadwal
          </Button>
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
