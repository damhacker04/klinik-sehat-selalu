"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface JadwalItem {
    id_jadwal: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    dokter?: { nama: string } | null;
    perawat?: { nama: string } | null;
}

export default function JadwalPerawatPage() {
    const [jadwal, setJadwal] = useState<JadwalItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJadwal() {
            try {
                const res = await fetch("/api/admin/jadwal");
                if (res.ok) {
                    const data = await res.json();
                    setJadwal(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch jadwal:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchJadwal();
    }, []);

    const hariOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const sorted = [...jadwal].sort(
        (a, b) => hariOrder.indexOf(a.hari) - hariOrder.indexOf(b.hari)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Jadwal Praktik"
                description="Jadwal praktik Anda di Klinik Sehat Selalu"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-emerald-500" />
                        Jadwal Mingguan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!loading && sorted.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="Belum Ada Jadwal"
                            description="Jadwal Anda belum diatur oleh admin. Hubungi admin untuk pengaturan jadwal."
                        />
                    ) : (
                        <div className="space-y-3">
                            {sorted.map((item) => (
                                <div
                                    key={item.id_jadwal}
                                    className="flex items-center gap-4 rounded-lg border p-4"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.hari}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.jam_mulai} — {item.jam_selesai}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
