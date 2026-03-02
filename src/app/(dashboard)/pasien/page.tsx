"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  Bell,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function PasienDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Pasien"
        description="Selamat datang di Klinik Sehat Selalu"
        action={
          <Link href="/pasien/pendaftaran">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Daftar Kunjungan
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Status Pendaftaran"
          value="-"
          icon={ClipboardList}
          description="Belum ada pendaftaran aktif"
          roleColor="pasien"
        />
        <StatCard
          title="Nomor Antrian"
          value="-"
          icon={Clock}
          description="Tidak dalam antrian"
          roleColor="pasien"
        />
        <StatCard
          title="Riwayat Kunjungan"
          value="0"
          icon={FileText}
          description="Total kunjungan"
          roleColor="pasien"
        />
        <StatCard
          title="Feedback"
          value="0"
          icon={MessageSquare}
          description="Feedback diberikan"
          roleColor="pasien"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifikasi Terbaru */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notifikasi Terbaru
            </CardTitle>
            <Link href="/pasien/notifikasi">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Belum ada notifikasi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/pasien/pendaftaran">
              <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Daftar Kunjungan Baru</p>
                  <p className="text-xs text-muted-foreground">
                    Isi form pendaftaran untuk kunjungan
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
            </Link>
            <Link href="/pasien/antrian">
              <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Cek Antrian</p>
                  <p className="text-xs text-muted-foreground">
                    Lihat posisi antrian Anda saat ini
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
            </Link>
            <Link href="/pasien/feedback">
              <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Beri Feedback</p>
                  <p className="text-xs text-muted-foreground">
                    Berikan penilaian layanan klinik
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
