"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Archive,
  OctagonAlert,
  ArrowRight,
  Package,
  CheckCircle,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ApotekerStats {
  resepMasuk: number;
  totalObat: number;
  stokMenipis: number;
  pengadaanPending: number;
}

interface ResepItem {
  id_resep: number;
  status: string;
  tanggal_resep: string;
  detail_resep: { id_detail?: number; obat: { nama_obat: string } | null }[];
  rekam_medis: { pasien: { nama: string } | null } | null;
}

interface RiwayatItem {
  id_resep: number;
  status: string;
  tanggal_resep: string;
}

interface ObatItem {
  id_obat: number;
  nama_obat: string;
  stok: number;
  stok_minimum: number;
  satuan: string | null;
  harga: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-white/8 ${className ?? ""}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <SkeletonBlock className="h-10 w-80" />
        <SkeletonBlock className="h-5 w-64" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-white/3 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4"
          >
            <div className="flex justify-between">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="h-10 w-16" />
            <SkeletonBlock className="h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white/80 dark:bg-white/3 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/8">
            <SkeletonBlock className="h-6 w-44" />
          </div>
          <div className="p-3 space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5">
                <SkeletonBlock className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-9 w-32 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white/80 dark:bg-white/3 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/8">
            <SkeletonBlock className="h-6 w-36" />
          </div>
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                <SkeletonBlock className="h-6 w-6 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-6 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApotekerDashboard() {
  const router = useRouter();
  const { userName } = useUser();

  const [stats, setStats] = useState<ApotekerStats>({
    resepMasuk: 0,
    totalObat: 0,
    stokMenipis: 0,
    pengadaanPending: 0,
  });
  const [recentResep, setRecentResep] = useState<ResepItem[]>([]);
  const [criticalStock, setCriticalStock] = useState<ObatItem[]>([]);
  const [resepSelesaiHariIni, setResepSelesaiHariIni] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, resepRes, stokRes, riwayatRes] = await Promise.all([
          fetch("/api/apoteker/stats"),
          fetch("/api/apoteker/resep"),
          fetch("/api/apoteker/stok"),
          fetch("/api/apoteker/riwayat"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());

        if (resepRes.ok) {
          const resepData: ResepItem[] = await resepRes.json();
          setRecentResep(Array.isArray(resepData) ? resepData.slice(0, 3) : []);
        }

        if (stokRes.ok) {
          const stokData: ObatItem[] = await stokRes.json();
          const critical = (Array.isArray(stokData) ? stokData : [])
            .filter((o) => o.stok <= o.stok_minimum)
            .slice(0, 5);
          setCriticalStock(critical);
        }

        if (riwayatRes.ok) {
          const riwayatData: RiwayatItem[] = await riwayatRes.json();
          const today = new Date().toDateString();
          const selesai = (Array.isArray(riwayatData) ? riwayatData : []).filter(
            (r) =>
              r.status === "completed" &&
              new Date(r.tanggal_resep).toDateString() === today
          ).length;
          setResepSelesaiHariIni(selesai);
        }
      } catch (err) {
        console.error("Failed to fetch apoteker dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const firstName = getFirstName(userName || "Apoteker");
  const greeting = getGreeting();

  // ── Stat card config ──────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Resep Masuk",
      value: stats.resepMasuk,
      Icon: Inbox,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      badge: "Pending",
      badgeBg: "bg-amber-500/20",
      badgeColor: "text-amber-500",
      badgeBorder: "border-amber-500/30",
      shadowHover: "hover:shadow-amber-500/10",
      pulse: false,
    },
    {
      label: "Resep Selesai",
      value: resepSelesaiHariIni,
      Icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      badge: "Hari Ini",
      badgeBg: "bg-emerald-500/20",
      badgeColor: "text-emerald-500",
      badgeBorder: "border-emerald-500/30",
      shadowHover: "hover:shadow-emerald-500/10",
      pulse: false,
    },
    {
      label: "Stok Menipis",
      value: stats.stokMenipis,
      Icon: AlertTriangle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      badge: "Peringatan",
      badgeBg: "bg-red-500/20",
      badgeColor: "text-red-500",
      badgeBorder: "border-red-500/30",
      shadowHover: "hover:shadow-red-500/10",
      pulse: true,
    },
    {
      label: "Total Jenis Obat",
      value: stats.totalObat,
      Icon: Archive,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      badge: "Katalog",
      badgeBg: "bg-blue-500/20",
      badgeColor: "text-blue-500",
      badgeBorder: "border-blue-500/30",
      shadowHover: "hover:shadow-blue-500/10",
      pulse: false,
    },
  ];

  return (
    <div className="-m-4 md:-m-6 min-h-screen bg-slate-50 dark:bg-[#101322] p-4 md:p-8 space-y-8">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {greeting}, Apt. {firstName}! 💊
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
          {stats.resepMasuk > 0 ? (
            <>
              Anda memiliki{" "}
              <span className="text-amber-500 font-semibold">
                {stats.resepMasuk} resep pending
              </span>{" "}
              yang butuh divalidasi.
            </>
          ) : (
            "Tidak ada resep pending saat ini. Semua resep telah diproses."
          )}
        </p>
      </header>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, Icon, iconBg, iconColor, badge, badgeBg, badgeColor, badgeBorder, shadowHover, pulse }) => (
          <div
            key={label}
            className={`group bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${shadowHover} cursor-default`}
          >
            <div className="flex justify-between items-start mb-5">
              <div className={`p-3 rounded-2xl ${iconBg} ${iconColor} ${pulse ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeBg} ${badgeColor} border ${badgeBorder}`}>
                {badge}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                {value}
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                {label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Content Grid ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left: Resep Masuk Terbaru */}
        <div className="lg:col-span-3 bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Resep Masuk Terbaru
            </h2>
          </div>

          <div className="flex-1 p-2">
            {recentResep.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-500">
                <CheckCircle className="h-12 w-12" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  Tidak Ada Resep Pending
                </p>
                <p className="text-sm text-center px-4">
                  Semua resep telah diproses atau belum ada resep masuk.
                </p>
              </div>
            ) : (
              recentResep.map((resep, idx) => {
                const patientName =
                  resep.rekam_medis?.pasien?.nama ?? "Pasien Tidak Diketahui";
                const itemCount = resep.detail_resep?.length ?? 0;
                const isLast = idx === recentResep.length - 1;

                return (
                  <div
                    key={resep.id_resep}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors rounded-2xl gap-4 ${
                      !isLast ? "border-b border-slate-100 dark:border-white/5" : ""
                    }`}
                  >
                    {/* Left: Avatar + info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/15 dark:bg-blue-600/20 flex items-center justify-center text-primary dark:text-blue-400 font-bold text-sm shrink-0">
                        #{resep.id_resep}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {patientName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {itemCount} Item Obat
                        </p>
                      </div>
                    </div>

                    {/* Right: Time + Button */}
                    <div className="flex items-center justify-between md:justify-end gap-5 md:shrink-0">
                      <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                        {timeAgo(resep.tanggal_resep)}
                      </span>
                      <button
                        onClick={() => router.push("/apoteker/resep")}
                        className="flex items-center gap-2 bg-primary hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap"
                      >
                        Proses Sekarang
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/8 text-center">
            <button
              onClick={() => router.push("/apoteker/resep")}
              className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              Lihat Semua Resep
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Stok Obat Kritis */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Stok Obat Kritis
            </h2>
          </div>

          <div className="flex-1 p-4 space-y-2">
            {criticalStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 dark:text-slate-500">
                <Package className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  Semua Stok Aman
                </p>
                <p className="text-sm text-center px-2">
                  Tidak ada obat di bawah batas minimum.
                </p>
              </div>
            ) : (
              criticalStock.map((item) => (
                <div
                  key={item.id_obat}
                  className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-white/5 rounded-2xl border border-red-100 dark:border-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <OctagonAlert className="h-5 w-5 text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.nama_obat}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">
                        Batas Min: {item.stok_minimum} {item.satuan || "unit"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-red-500 font-extrabold text-lg leading-none shrink-0 ml-3">
                    {item.stok}
                    <span className="text-[10px] font-medium opacity-70 ml-0.5">
                      {item.satuan || "unit"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/8 bg-red-50/50 dark:bg-red-500/5 text-center">
            <button
              onClick={() => router.push("/apoteker/stok-menipis")}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              Lihat Semua Stok Menipis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
