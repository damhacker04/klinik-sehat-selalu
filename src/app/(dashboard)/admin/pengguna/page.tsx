"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  [key: string]: unknown;
}

const roleColors: Record<string, string> = {
  pasien: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  perawat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  dokter: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  apoteker: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  kasir: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export default function PenggunaPage() {
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/pengguna");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch pengguna:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const res = await fetch("/api/admin/pengguna", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        toast.success("Role berhasil diubah");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mengubah role");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

  const columns: Column<UserRow>[] = [
    {
      key: "email",
      header: "Email",
      cell: (row) => <span className="font-medium">{row.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant="outline" className={`capitalize font-medium ${roleColors[row.role] || ""}`}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Terdaftar",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.created_at}</span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => (
        <select
          className="text-sm border rounded px-2 py-1"
          value={row.role}
          onChange={(e) => handleChangeRole(row.id, e.target.value)}
        >
          {["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Kelola Pengguna"
        description="Lihat dan kelola akun pengguna serta assign role"
      />

      {!loading && data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Pengguna"
          description="Pengguna yang terdaftar akan muncul di sini."
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari email..."
          searchKey="email"
        />
      )}
    </div>
  );
}
