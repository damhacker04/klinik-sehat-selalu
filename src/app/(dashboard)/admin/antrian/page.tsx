"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Phone } from "lucide-react";

export default function AdminAntrianPage() {
  // TODO: Fetch from Supabase antrian hari ini
  const antrian: unknown[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Kelola Antrian"
        description="Pantau dan kelola antrian pasien hari ini"
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Dipanggil</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {antrian.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum Ada Antrian"
          description="Antrian hari ini kosong. Antrian akan muncul setelah ada pendaftaran yang diverifikasi."
        />
      ) : (
        <div className="space-y-3">
          {/* TODO: Queue list with call and done buttons */}
        </div>
      )}
    </div>
  );
}
