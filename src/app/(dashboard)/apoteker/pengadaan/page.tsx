"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";

export default function PengadaanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch("/api/apoteker/pengadaan");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Pengadaan Obat" description="Kelola permintaan pengadaan obat"
        action={<Button><Plus className="h-4 w-4 mr-2" /> Buat Permintaan</Button>}
      />
      {!loading && data.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Belum Ada Pengadaan" description="Permintaan pengadaan obat akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_request} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{item.obat?.nama_obat || "Obat"}</p>
                <p className="text-sm text-muted-foreground">Jumlah: {item.jumlah_diminta} unit</p>
                {item.catatan && <p className="text-sm text-muted-foreground">Catatan: {item.catatan}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${item.status === "received" ? "bg-emerald-100 text-emerald-700" : item.status === "ordered" ? "bg-blue-100 text-blue-700" : item.status === "approved" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
