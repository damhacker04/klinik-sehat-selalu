"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Pill, CalendarCheck } from "lucide-react";

interface DokterStats {
  antrianPasien: number;
  pemeriksaanHariIni: number;
  resepDibuat: number;
  kontrolLanjutan: number;
}

export default function DokterDashboard() {
  const [stats, setStats] = useState<DokterStats>({
    antrianPasien: 0,
    pemeriksaanHariIni: 0,
    resepDibuat: 0,
    kontrolLanjutan: 0,
  });
  const [antrian, setAntrian] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, antrianRes] = await Promise.all([
          fetch("/api/dokter/stats"),
          fetch("/api/dokter/antrian"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (antrianRes.ok) {
          const data = await antrianRes.json();
          setAntrian(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch dokter data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Dokter"
        description="Kelola pemeriksaan dan rekam medis pasien"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Antrian Pasien"
          value={loading ? "..." : String(stats.antrianPasien)}
          icon={Users}
          description="Menunggu pemeriksaan"
          roleColor="dokter"
        />
        <StatCard
          title="Pemeriksaan Hari Ini"
          value={loading ? "..." : String(stats.pemeriksaanHariIni)}
          icon={Stethoscope}
          description="Pasien sudah diperiksa"
          roleColor="dokter"
        />
        <StatCard
          title="Resep Dibuat"
          value={loading ? "..." : String(stats.resepDibuat)}
          icon={Pill}
          description="Resep hari ini"
          roleColor="dokter"
        />
        <StatCard
          title="Kontrol Lanjutan"
          value={loading ? "..." : String(stats.kontrolLanjutan)}
          icon={CalendarCheck}
          description="Pasien perlu kontrol"
          roleColor="dokter"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pasien Menunggu Pemeriksaan</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && antrian.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="Tidak Ada Pasien Menunggu"
              description="Pasien yang sudah melewati pemeriksaan awal perawat akan muncul di sini."
            />
          ) : (
            <div className="space-y-3">
              {antrian.map((item: any) => (
                <div key={item.id_rekam} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.pasien?.nama || "Pasien"}</p>
                    <p className="text-sm text-muted-foreground">
                      Vital: TD {item.tekanan_darah || "-"}, Suhu {item.suhu || "-"}°C, BB {item.berat_badan || "-"} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
