"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreditCard, FileText, Printer, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PasienTagihanPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);

    async function fetchData() {
        try {
            const res = await fetch("/api/pasien/tagihan");
            if (res.ok) {
                const result = await res.json();
                setData(Array.isArray(result) ? result : []);
            }
        } catch (err) {
            console.error("Failed to fetch tagihan:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const formatRupiah = (n: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(n);

    const handlePayment = async (id_transaksi: number, metode: string) => {
        setProcessing(id_transaksi);
        try {
            const res = await fetch("/api/pasien/tagihan", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_transaksi, metode_pembayaran: metode })
            });
            if (res.ok) {
                toast.success(`Pembayaran dengan ${metode} berhasil!`);
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal melakukan pembayaran");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Tagihan Saya"
                description="Pantau riwayat invoice dan pembayaran tagihan layanan medis Anda"
                className="print:hidden"
            />

            {!loading && data.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title="Tidak Ada Tagihan"
                    description="Anda belum memiliki riwayat tagihan atau pembayaran."
                />
            ) : (
                <div className="space-y-4">
                    {data.map((invoice: any) => (
                        <div key={invoice.id_transaksi} className="rounded-lg border p-4 space-y-3 bg-card shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold flex items-center gap-2">
                                        Invoice #{invoice.id_transaksi}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Tanggal Periksa:{" "}
                                        {invoice.rekam_medis?.tanggal_periksa
                                            ? new Date(invoice.rekam_medis.tanggal_periksa).toLocaleDateString("id-ID")
                                            : "-"}
                                    </p>
                                    {invoice.rekam_medis?.dokter?.nama && (
                                        <p className="text-sm text-muted-foreground">
                                            Dokter: {invoice.rekam_medis.dokter.nama}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <StatusBadge status={invoice.status} />
                                    </div>
                                    <p className="font-bold text-lg text-primary">{formatRupiah(invoice.total_biaya)}</p>
                                </div>
                            </div>

                            <div className="pt-3 border-t">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Lihat Rincian
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Detail Tagihan #{invoice.id_transaksi}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-3">
                                            <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                                                {invoice.rincian_transaksi?.map((rincian: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{rincian.keterangan}</span>
                                                        <span className="font-medium">{formatRupiah(rincian.biaya)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total Tagihan</span>
                                                <span>{formatRupiah(invoice.total_biaya)}</span>
                                            </div>

                                            {invoice.status === "draft" && (
                                                <div className="mt-4 pt-4 border-t space-y-4">
                                                    <p className="text-sm text-center text-muted-foreground">Silakan pilih metode pembayaran untuk menyelesaikan tagihan ini.</p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handlePayment(invoice.id_transaksi, "transfer")}
                                                            disabled={processing === invoice.id_transaksi}
                                                            className="flex-1"
                                                        >
                                                            <Wallet className="w-4 h-4 mr-2" /> Transfer Bank
                                                        </Button>
                                                        <Button
                                                            onClick={() => handlePayment(invoice.id_transaksi, "kartu")}
                                                            disabled={processing === invoice.id_transaksi}
                                                            variant="outline"
                                                            className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" /> Kartu Kredit
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {invoice.status === "paid" && (
                                                <div className="mt-4 pt-4 border-t space-y-4">
                                                    <div className="text-sm text-center text-muted-foreground">
                                                        Metode Pembayaran: <span className="capitalize">{invoice.metode_pembayaran}</span>
                                                        <br />
                                                        Lunas pada: {new Date(invoice.tanggal_bayar).toLocaleDateString("id-ID", {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </div>
                                                    <Button variant="default" className="w-full print:hidden" onClick={() => window.print()}>
                                                        <Printer className="h-4 w-4 mr-2" /> Download / Cetak Invoice
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
