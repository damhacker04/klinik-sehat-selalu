"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

export default function AntrianPage() {
  const [antrian, setAntrian] = useState<any>(null);
  const [currentServing, setCurrentServing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAntrian() {
      try {
        const res = await fetch("/api/pasien/antrian");
        if (res.ok) {
          const data = await res.json();
          setAntrian(data.antrian);
          setCurrentServing(data.currentServing);
        }
      } catch (err) {
        console.error("Failed to fetch antrian:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAntrian();
    // Poll every 10 seconds for real-time-like updates
    const interval = setInterval(fetchAntrian, 10000);
    return () => clearInterval(interval);
  }, []);

  const hasAntrian = !loading && antrian !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Status Antrian"
        description="Pantau posisi antrian Anda secara real-time"
      />

      {!hasAntrian ? (
        <EmptyState
          icon={Clock}
          title="Tidak Ada Antrian Aktif"
          description="Anda tidak sedang dalam antrian. Daftar kunjungan terlebih dahulu untuk mendapat nomor antrian."
          action={{
            label: "Daftar Kunjungan",
            onClick: () => (window.location.href = "/pasien/pendaftaran"),
          }}
        />
      ) : (
        <div className="grid gap-6 max-w-lg mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Nomor Antrian Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    {antrian.nomor_antrian}
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {antrian.status === "waiting" ? "Menunggu" : antrian.status === "called" ? "Dipanggil!" : antrian.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Antrian Saat Ini</p>
                  <p className="text-xs text-muted-foreground">
                    Sedang dilayani
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">{currentServing || "--"}</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
