"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function TransaksiPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Buat Transaksi"
        description="Proses pembayaran pasien"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-orange-500" />
              Pilih Pasien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CreditCard}
              title="Belum Ada Transaksi"
              description="Pilih pasien yang sudah selesai diperiksa untuk membuat transaksi pembayaran."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rincian Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Pilih pasien untuk melihat rincian biaya
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
