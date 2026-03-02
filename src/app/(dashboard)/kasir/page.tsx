"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, TrendingUp, Clock, Plus } from "lucide-react";

export default function KasirDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Kasir"
        description="Kelola pembayaran pasien"
        action={
          <Link href="/kasir/transaksi">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Transaksi Baru
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Menunggu Bayar"
          value="0"
          icon={Clock}
          description="Transaksi draft"
          roleColor="kasir"
        />
        <StatCard
          title="Transaksi Hari Ini"
          value="0"
          icon={CreditCard}
          description="Pembayaran selesai"
          roleColor="kasir"
        />
        <StatCard
          title="Total Pendapatan"
          value="Rp 0"
          icon={TrendingUp}
          description="Pendapatan hari ini"
          roleColor="kasir"
        />
        <StatCard
          title="Bukti Bayar"
          value="0"
          icon={Receipt}
          description="Dicetak hari ini"
          roleColor="kasir"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaksi Menunggu Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CreditCard}
            title="Tidak Ada Transaksi Menunggu"
            description="Transaksi baru akan muncul setelah pasien selesai diperiksa dan mendapat resep."
          />
        </CardContent>
      </Card>
    </div>
  );
}
