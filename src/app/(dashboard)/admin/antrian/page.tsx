"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Phone } from "lucide-react";
import { toast } from "sonner";

export default function AdminAntrianPage() {
  const [antrian, setAntrian] = useState<any[]>([]);
  const [counts, setCounts] = useState({ waiting: 0, called: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/antrian");
      if (res.ok) {
        const data = await res.json();
        setAntrian(data.antrian || []);
        setCounts(data.counts || { waiting: 0, called: 0, done: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch antrian:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAction(id_antrian: number, action: "call" | "done") {
    try {
      const res = await fetch("/api/admin/antrian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_antrian, action }),
      });
      if (res.ok) {
        toast.success(action === "call" ? "Pasien dipanggil" : "Antrian selesai");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memproses");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

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
              <p className="text-2xl font-bold">{counts.waiting}</p>
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
              <p className="text-2xl font-bold">{counts.called}</p>
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
              <p className="text-2xl font-bold">{counts.done}</p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!loading && antrian.filter((a: any) => a.status !== "done").length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum Ada Antrian"
          description="Antrian hari ini kosong. Antrian akan muncul setelah ada pendaftaran yang diverifikasi."
        />
      ) : (
        <div className="space-y-3">
          {antrian
            .filter((a: any) => a.status !== "done")
            .map((item: any) => (
              <div key={item.id_antrian} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {item.nomor_antrian}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{item.form_pendaftaran?.pasien?.nama || "Pasien"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.form_pendaftaran?.keluhan || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${item.status === "waiting"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {item.status}
                  </span>
                  {item.status === "waiting" && (
                    <Button size="sm" onClick={() => handleAction(item.id_antrian, "call")}>
                      Panggil
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
