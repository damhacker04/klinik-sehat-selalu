"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt, FileText, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function KasirBuktiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/kasir/bukti");
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:p-0">
      <PageHeader title="Bukti Pembayaran" description="Cetak dan kelola bukti pembayaran pasien" className="print:hidden" />
      {!loading && data.length === 0 ? (
        <EmptyState icon={Receipt} title="Belum Ada Bukti" description="Bukti pembayaran akan muncul setelah ada transaksi selesai." />
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id_transaksi} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">#{item.id_transaksi} — {item.pasien?.nama || "Pasien"}</p>
                <p className="text-sm text-muted-foreground">{item.tanggal_bayar ? new Date(item.tanggal_bayar).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-bold">{formatRupiah(item.total_biaya)}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{item.status}</span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Cetak Struk
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kwitansi / Bukti Pembayaran #{item.id_transaksi}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="border rounded-md p-3 space-y-2 bg-muted/20">
                        {item.rincian_transaksi?.map((rincian: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{rincian.keterangan}</span>
                            <span className="font-medium">{formatRupiah(rincian.biaya)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(item.total_biaya)}</span>
                      </div>

                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                          Metode Pembayaran: <span className="capitalize">{item.metode_pembayaran || "Cash"}</span>
                          <br />
                          Lunas pada: {item.tanggal_bayar ? new Date(item.tanggal_bayar).toLocaleDateString("id-ID", {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                          }) : "-"}
                        </div>
                        <Button variant="default" className="w-full print:hidden" onClick={() => window.print()}>
                          <Printer className="h-4 w-4 mr-2" /> Download / Cetak Invoice
                        </Button>
                      </div>
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
