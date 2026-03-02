"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";

export default function PengadaanPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengadaan Obat"
        description="Kelola purchase request untuk pengadaan obat"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Request
          </Button>
        }
      />
      <EmptyState
        icon={ShoppingCart}
        title="Belum Ada Request Pengadaan"
        description="Buat purchase request baru untuk pengadaan obat yang dibutuhkan."
      />
    </div>
  );
}
