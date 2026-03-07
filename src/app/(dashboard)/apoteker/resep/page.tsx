"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pill } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ApotekerResepPage() {
  const [resepList, setResepList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/apoteker/resep");
      if (res.ok) {
        const data = await res.json();
        setResepList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch resep:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleUpdateStatus(id_resep: number, status: "processing" | "completed") {
    try {
      const res = await fetch("/api/apoteker/resep", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_resep, status }),
      });
      if (res.ok) {
        toast.success(status === "completed" ? "Resep selesai diproses" : "Resep sedang diproses");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal update status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Resep Masuk" description="Proses resep dari dokter dan siapkan obat" />
      {!loading && resepList.length === 0 ? (
        <EmptyState icon={Pill} title="Tidak Ada Resep Masuk" description="Resep baru dari dokter akan muncul di sini untuk diproses." />
      ) : (
        <div className="space-y-4">
          {resepList.map((resep: any) => (
            <div key={resep.id_resep} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pasien: {resep.rekam_medis?.pasien?.nama || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    Tanggal: {new Date(resep.tanggal_resep).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={resep.rekam_medis?.transaksi?.[0]?.status === "paid" ? "default" : "secondary"}>
                    {resep.rekam_medis?.transaksi?.[0]?.status === "paid" ? "Tagihan Lunas" : "Belum Lunas"}
                  </Badge>
                  <StatusBadge status={resep.status} />
                </div>
              </div>
              <div className="space-y-1">
                {(resep.detail_resep || []).map((d: any, i: number) => (
                  <p key={i} className="text-sm">
                    • {d.obat?.nama_obat || "Obat"} — {d.jumlah} unit {d.dosis ? `(${d.dosis})` : ""}
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                {resep.status === "pending" && (
                  <Button size="sm" onClick={() => handleUpdateStatus(resep.id_resep, "processing")}>
                    Proses Resep
                  </Button>
                )}
                {resep.status === "processing" && (
                  <Button size="sm" onClick={() => handleUpdateStatus(resep.id_resep, "completed")}>
                    Selesai
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
