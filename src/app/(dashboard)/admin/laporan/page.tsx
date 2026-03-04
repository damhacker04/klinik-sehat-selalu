"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LaporanData {
  jumlahPasien: number;
  jumlahTransaksi: number;
  totalPendapatan: number;
  weeklyPasien: { hari: string; pasien: number }[];
  weeklyPendapatan: { hari: string; pendapatan: number }[];
}

export default function LaporanPage() {
  const [data, setData] = useState<LaporanData>({
    jumlahPasien: 0,
    jumlahTransaksi: 0,
    totalPendapatan: 0,
    weeklyPasien: [],
    weeklyPendapatan: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/laporan");
        if (res.ok) {
          setData(await res.json());
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

  const formatRupiahShort = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return String(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Laporan Harian"
        description="Statistik dan ringkasan operasional klinik"
      />

      <div className="grid gap-4 sm:grid-cols-3 stagger-children">
        <StatCard
          title="Jumlah Pasien"
          value={loading ? "..." : String(data.jumlahPasien)}
          icon={Users}
          description="Hari ini"
          roleColor="admin"
        />
        <StatCard
          title="Transaksi"
          value={loading ? "..." : String(data.jumlahTransaksi)}
          icon={CreditCard}
          description="Hari ini"
          roleColor="admin"
        />
        <StatCard
          title="Total Pendapatan"
          value={loading ? "..." : formatRupiah(data.totalPendapatan)}
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
              Grafik Pasien (7 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.weeklyPasien.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weeklyPasien}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hari" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="pasien" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Belum ada data pasien
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Grafik Pendapatan (7 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.weeklyPendapatan.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weeklyPendapatan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hari" />
                    <YAxis tickFormatter={formatRupiahShort} />
                    <Tooltip
                      formatter={(value: number | undefined) => [formatRupiah(value ?? 0), "Pendapatan"]}
                    />
                    <Bar dataKey="pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Belum ada data pendapatan
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
