"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Users, Pill, CalendarCheck } from "lucide-react";

export default function DokterDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Dokter"
        description="Kelola pemeriksaan dan rekam medis pasien"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Antrian Pasien"
          value="0"
          icon={Users}
          description="Menunggu pemeriksaan"
          roleColor="dokter"
        />
        <StatCard
          title="Pemeriksaan Hari Ini"
          value="0"
          icon={Stethoscope}
          description="Pasien sudah diperiksa"
          roleColor="dokter"
        />
        <StatCard
          title="Resep Dibuat"
          value="0"
          icon={Pill}
          description="Resep hari ini"
          roleColor="dokter"
        />
        <StatCard
          title="Kontrol Lanjutan"
          value="0"
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
          <EmptyState
            icon={Stethoscope}
            title="Tidak Ada Pasien Menunggu"
            description="Pasien yang sudah melewati pemeriksaan awal perawat akan muncul di sini."
          />
        </CardContent>
      </Card>
    </div>
  );
}
