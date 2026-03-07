"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";

export default function ApotekerRiwayatPage() {
    const [resepList, setResepList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            const res = await fetch("/api/apoteker/riwayat");
            if (res.ok) {
                const data = await res.json();
                setResepList(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch riwayat resep:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Riwayat Resep Masuk" description="Daftar resep obat yang sudah selesai diproses" />
            {!loading && resepList.length === 0 ? (
                <EmptyState icon={ClipboardList} title="Tidak Ada Riwayat" description="Data resep yang telah diproses akan muncul di sini." />
            ) : (
                <div className="space-y-4">
                    {resepList.map((resep: any) => (
                        <div key={resep.id_resep} className="rounded-lg border p-4 space-y-3 bg-muted/10">
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
