"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

export default function StokObatPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Stok Obat"
        description="Kelola inventori obat klinik"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Obat
          </Button>
        }
      />
      <EmptyState
        icon={Package}
        title="Belum Ada Data Obat"
        description="Tambahkan data obat untuk mulai mengelola inventori."
        action={{
          label: "Tambah Obat Pertama",
          onClick: () => {},
        }}
      />
    </div>
  );
}
