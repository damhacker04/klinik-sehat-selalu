"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill, Package, AlertTriangle, ShoppingCart } from "lucide-react";

interface ApotekerStats {
  resepMasuk: number;
  totalObat: number;
  stokMenipis: number;
  pengadaanPending: number;
}

interface ObatItem {
  id_obat: number;
  nama_obat: string;
  stok: number;
  stok_minimum: number;
  satuan: string | null;
  harga: number;
}

export default function ApotekerDashboard() {
  const [stats, setStats] = useState<ApotekerStats>({
    resepMasuk: 0,
    totalObat: 0,
    stokMenipis: 0,
    pengadaanPending: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<ObatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, stokRes] = await Promise.all([
          fetch("/api/apoteker/stats"),
          fetch("/api/apoteker/stok"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (stokRes.ok) {
          const allObat = await stokRes.json();
          const lowStock = (Array.isArray(allObat) ? allObat : []).filter(
            (o: ObatItem) => o.stok <= o.stok_minimum
          );
          setLowStockItems(lowStock);
        }
      } catch (err) {
        console.error("Failed to fetch apoteker data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Apoteker"
        description="Kelola resep dan stok obat"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Resep Masuk"
          value={loading ? "..." : String(stats.resepMasuk)}
          icon={Pill}
          description="Resep menunggu diproses"
          roleColor="apoteker"
        />
        <StatCard
          title="Total Obat"
          value={loading ? "..." : String(stats.totalObat)}
          icon={Package}
          description="Jenis obat tersedia"
          roleColor="apoteker"
        />
        <StatCard
          title="Stok Menipis"
          value={loading ? "..." : String(stats.stokMenipis)}
          icon={AlertTriangle}
          description="Obat di bawah threshold"
          roleColor="apoteker"
        />
        <StatCard
          title="Pengadaan"
          value={loading ? "..." : String(stats.pengadaanPending)}
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
          {!loading && lowStockItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Semua Stok Aman"
              description="Tidak ada obat dengan stok di bawah batas minimum."
            />
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id_obat} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.nama_obat}</p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {item.stok} {item.satuan || "unit"} (min: {item.stok_minimum})
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    Rendah
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
