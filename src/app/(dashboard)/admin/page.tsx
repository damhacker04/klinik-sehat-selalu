"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardCheck,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";

interface AdminStats {
  pendingVerifikasi: number;
  antrianHariIni: number;
  pasienHariIni: number;
  pendapatan: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    pendingVerifikasi: 0,
    antrianHariIni: 0,
    pasienHariIni: 0,
    pendapatan: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
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
        title="Dashboard Admin"
        description="Kelola operasional Klinik Sehat Selalu"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Pending Verifikasi"
          value={loading ? "..." : String(stats.pendingVerifikasi)}
          icon={ClipboardCheck}
          description="Form menunggu verifikasi"
          roleColor="admin"
        />
        <StatCard
          title="Antrian Hari Ini"
          value={loading ? "..." : String(stats.antrianHariIni)}
          icon={Clock}
          description="Pasien dalam antrian"
          roleColor="admin"
        />
        <StatCard
          title="Pasien Hari Ini"
          value={loading ? "..." : String(stats.pasienHariIni)}
          icon={Users}
          description="Total pasien dilayani"
          roleColor="admin"
        />
        <StatCard
          title="Pendapatan"
          value={loading ? "..." : formatRupiah(stats.pendapatan)}
          icon={DollarSign}
          description="Pendapatan hari ini"
          roleColor="admin"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Statistik Pasien Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Grafik akan muncul setelah ada data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              {
                href: "/admin/verifikasi",
                icon: ClipboardCheck,
                title: "Verifikasi Pendaftaran",
                desc: "Review dan verifikasi form pasien",
                color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
              },
              {
                href: "/admin/jadwal",
                icon: Calendar,
                title: "Kelola Jadwal",
                desc: "Atur jadwal dokter dan perawat",
                color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
              },
              {
                href: "/admin/laporan",
                icon: BarChart3,
                title: "Laporan Harian",
                desc: "Lihat statistik dan laporan",
                color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
