"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Clock } from "lucide-react";

export default function PerawatDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Perawat"
        description="Kelola pemeriksaan awal pasien"
      />

      <div className="grid gap-4 sm:grid-cols-3 stagger-children">
        <StatCard
          title="Antrian Pasien"
          value="0"
          icon={Clock}
          description="Menunggu pemeriksaan awal"
          roleColor="perawat"
        />
        <StatCard
          title="Sudah Diperiksa"
          value="0"
          icon={Activity}
          description="Pemeriksaan hari ini"
          roleColor="perawat"
        />
        <StatCard
          title="Total Pasien"
          value="0"
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
          <EmptyState
            icon={Activity}
            title="Tidak Ada Pasien Menunggu"
            description="Pasien yang siap diperiksa akan muncul di sini."
          />
        </CardContent>
      </Card>
    </div>
  );
}
