"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill, Package, AlertTriangle, ShoppingCart } from "lucide-react";

export default function ApotekerDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Apoteker"
        description="Kelola resep dan stok obat"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Resep Masuk"
          value="0"
          icon={Pill}
          description="Resep menunggu diproses"
          roleColor="apoteker"
        />
        <StatCard
          title="Total Obat"
          value="0"
          icon={Package}
          description="Jenis obat tersedia"
          roleColor="apoteker"
        />
        <StatCard
          title="Stok Menipis"
          value="0"
          icon={AlertTriangle}
          description="Obat di bawah threshold"
          roleColor="apoteker"
        />
        <StatCard
          title="Pengadaan"
          value="0"
          icon={ShoppingCart}
          description="Request pending"
          roleColor="apoteker"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alert Stok Menipis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="Semua Stok Aman"
            description="Tidak ada obat dengan stok di bawah batas minimum."
          />
        </CardContent>
      </Card>
    </div>
  );
}
