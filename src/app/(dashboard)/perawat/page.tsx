"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Clock } from "lucide-react";

interface PerawatStats {
  antrianWaiting: number;
  sudahDiperiksa: number;
  totalPasien: number;
}

interface PerawatAntrianItem {
  id_antrian: number;
  nomor_antrian: number;
  status: string;
  form_pendaftaran?: {
    keluhan: string | null;
    pasien?: { nama: string } | null;
  } | null;
}

export default function PerawatDashboard() {
  const [stats, setStats] = useState<PerawatStats>({
    antrianWaiting: 0,
    sudahDiperiksa: 0,
    totalPasien: 0,
  });
  const [antrian, setAntrian] = useState<PerawatAntrianItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, antrianRes] = await Promise.all([
          fetch("/api/perawat/stats"),
          fetch("/api/perawat/antrian"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (antrianRes.ok) {
          const data = await antrianRes.json();
          setAntrian(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch perawat data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Perawat"
        description="Kelola pemeriksaan awal pasien"
      />

      <div className="grid gap-4 sm:grid-cols-3 stagger-children">
        <StatCard
          title="Antrian Pasien"
          value={loading ? "..." : String(stats.antrianWaiting)}
          icon={Clock}
          description="Menunggu pemeriksaan awal"
          roleColor="perawat"
        />
        <StatCard
          title="Sudah Diperiksa"
          value={loading ? "..." : String(stats.sudahDiperiksa)}
          icon={Activity}
          description="Pemeriksaan hari ini"
          roleColor="perawat"
        />
        <StatCard
          title="Total Pasien"
          value={loading ? "..." : String(stats.totalPasien)}
          icon={Users}
          description="Pasien hari ini"
          roleColor="perawat"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pasien Menunggu Pemeriksaan</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && antrian.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Tidak Ada Pasien Menunggu"
              description="Pasien yang siap diperiksa akan muncul di sini."
            />
          ) : (
            <div className="space-y-3">
              {antrian.map((item) => (
                <div key={item.id_antrian} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">
                      Antrian #{item.nomor_antrian} — {item.form_pendaftaran?.pasien?.nama || "Pasien"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Keluhan: {item.form_pendaftaran?.keluhan || "-"}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {item.status}
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
