"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface JadwalRow {
  id: number;
  nama: string;
  role: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  [key: string]: unknown;
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
    cell: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8">
          Edit
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50">
          Hapus
        </Button>
      </div>
    ),
  },
];

export default function JadwalPage() {
  // TODO: Fetch from Supabase jadwal
  const data: JadwalRow[] = [];

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

      {data.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Belum Ada Jadwal"
          description="Tambahkan jadwal praktik dokter dan perawat."
          action={{
            label: "Tambah Jadwal",
            onClick: () => {},
          }}
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
