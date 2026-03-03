"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PendaftaranRow {
  id: number;
  nama: string;
  tanggal: string;
  keluhan: string;
  status: "pending" | "verified" | "rejected";
  [key: string]: unknown;
}

export default function VerifikasiPage() {
  const [data, setData] = useState<PendaftaranRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/verifikasi");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch verifikasi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAction(id_form: number, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin/verifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_form, action }),
      });

      if (res.ok) {
        toast.success(action === "approve" ? "Pendaftaran diverifikasi" : "Pendaftaran ditolak");
        fetchData(); // Refresh data
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memproses");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
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
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={() => handleAction(row.id, "approve")}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => handleAction(row.id, "reject")}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Tolak
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Verifikasi Pendaftaran"
        description="Review dan verifikasi form pendaftaran pasien"
      />

      {!loading && data.length === 0 ? (
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
