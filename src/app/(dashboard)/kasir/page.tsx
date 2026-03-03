"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, TrendingUp, Clock, Plus } from "lucide-react";
import { formatRupiah } from "@/lib/supabase/queries";

interface KasirStats {
  menungguBayar: number;
  transaksiHariIni: number;
  totalPendapatan: number;
  buktiHariIni: number;
}

export default function KasirDashboard() {
  const [stats, setStats] = useState<KasirStats>({
    menungguBayar: 0,
    transaksiHariIni: 0,
    totalPendapatan: 0,
    buktiHariIni: 0,
  });
  const [draftTransaksi, setDraftTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, transaksiRes] = await Promise.all([
          fetch("/api/kasir/stats"),
          fetch("/api/kasir/transaksi"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (transaksiRes.ok) {
          const data = await transaksiRes.json();
          setDraftTransaksi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch kasir data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);



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
          value={loading ? "..." : String(stats.menungguBayar)}
          icon={Clock}
          description="Transaksi draft"
          roleColor="kasir"
        />
        <StatCard
          title="Transaksi Hari Ini"
          value={loading ? "..." : String(stats.transaksiHariIni)}
          icon={CreditCard}
          description="Pembayaran selesai"
          roleColor="kasir"
        />
        <StatCard
          title="Total Pendapatan"
          value={loading ? "..." : formatRupiah(stats.totalPendapatan)}
          icon={TrendingUp}
          description="Pendapatan hari ini"
          roleColor="kasir"
        />
        <StatCard
          title="Bukti Bayar"
          value={loading ? "..." : String(stats.buktiHariIni)}
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
          {!loading && draftTransaksi.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Tidak Ada Transaksi Menunggu"
              description="Transaksi baru akan muncul setelah pasien selesai diperiksa dan mendapat resep."
            />
          ) : (
            <div className="space-y-3">
              {draftTransaksi.map((item: any) => (
                <div key={item.id_transaksi} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {formatRupiah(item.total_biaya)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Draft
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
