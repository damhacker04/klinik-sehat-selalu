"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, XCircle } from "lucide-react";

interface PendaftaranRow {
  id: number;
  nama: string;
  tanggal: string;
  keluhan: string;
  status: "pending" | "verified" | "rejected";
  [key: string]: unknown;
}

const columns: Column<PendaftaranRow>[] = [
  {
    key: "nama",
    header: "Nama Pasien",
    cell: (row) => <span className="font-medium">{row.nama}</span>,
  },
  {
    key: "tanggal",
    header: "Tanggal Daftar",
    cell: (row) => <span className="text-sm text-muted-foreground">{row.tanggal}</span>,
  },
  {
    key: "keluhan",
    header: "Keluhan",
    cell: (row) => (
      <span className="text-sm max-w-[200px] truncate block">{row.keluhan}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "Aksi",
    cell: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50">
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Tolak
        </Button>
      </div>
    ),
  },
];

export default function VerifikasiPage() {
  // TODO: Fetch from Supabase form_pendaftaran where status = 'pending'
  const data: PendaftaranRow[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Verifikasi Pendaftaran"
        description="Review dan verifikasi form pendaftaran pasien"
      />

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Tidak Ada Pendaftaran Menunggu"
          description="Semua form pendaftaran sudah diverifikasi. Pendaftaran baru akan muncul di sini."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari nama pasien..."
          searchKey="nama"
        />
      )}
    </div>
  );
}
