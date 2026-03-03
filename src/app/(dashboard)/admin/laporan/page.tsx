"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, BarChart3 } from "lucide-react";

interface LaporanStats {
  jumlahPasien: number;
  jumlahTransaksi: number;
  totalPendapatan: number;
}

export default function LaporanPage() {
  const [stats, setStats] = useState<LaporanStats>({
    jumlahPasien: 0,
    jumlahTransaksi: 0,
    totalPendapatan: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/laporan");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch laporan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Laporan Harian"
        description="Statistik dan ringkasan operasional klinik"
      />

      <div className="grid gap-4 sm:grid-cols-3 stagger-children">
        <StatCard
          title="Jumlah Pasien"
          value={loading ? "..." : String(stats.jumlahPasien)}
          icon={Users}
          description="Hari ini"
          roleColor="admin"
        />
        <StatCard
          title="Transaksi"
          value={loading ? "..." : String(stats.jumlahTransaksi)}
          icon={CreditCard}
          description="Hari ini"
          roleColor="admin"
        />
        <StatCard
          title="Total Pendapatan"
          value={loading ? "..." : formatRupiah(stats.totalPendapatan)}
          icon={DollarSign}
          description="Hari ini"
          roleColor="admin"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Grafik Pasien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Grafik akan muncul setelah ada data
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Grafik Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Grafik akan muncul setelah ada data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
