"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Clock,
  Banknote,
  CheckCircle2,
  CalendarDays,
  Download,
  TrendingUp,
  MoreHorizontal,
  Check,
  Bell,
  ArrowRight,
  ClipboardCheck,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatRupiah } from "@/lib/supabase/queries";

interface WeeklyStatItem {
  hari: string;
  pasien: number;
  antrian: number;
}

interface AdminStats {
  pendingVerifikasi: number;
  antrianHariIni: number;
  pasienHariIni: number;
  pendapatan: number;
  weeklyStats: WeeklyStatItem[];
}

interface Activity {
  id: string;
  icon: "check" | "bell" | "user-plus";
  title: string;
  subtitle: string;
  color: "emerald" | "primary" | "slate";
}

interface StatCardDef {
  label: string;
  value: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const GLASS =
  "bg-white/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-white/5";

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    pendingVerifikasi: 0,
    antrianHariIni: 0,
    pasienHariIni: 0,
    pendapatan: 0,
    weeklyStats: [],
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<"7" | "30">("7");

  const todayShort = DAYS_ID[new Date().getDay()];
  const todayDisplay = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [statsRes, antrianRes, verifikasiRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/antrian"),
          fetch("/api/admin/verifikasi"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        const acts: Activity[] = [];

        if (antrianRes.ok) {
          const { antrian } = (await antrianRes.json()) as {
            antrian: Array<{
              id_antrian: string;
              nomor_antrian: number;
              status: string;
            }>;
          };
          for (const a of antrian ?? []) {
            if (a.status === "done") {
              acts.push({
                id: `antrian-done-${a.id_antrian}`,
                icon: "check",
                title: `Antrian A${String(a.nomor_antrian).padStart(3, "0")} selesai`,
                subtitle: "Layanan selesai",
                color: "emerald",
              });
            } else if (a.status === "called") {
              acts.push({
                id: `antrian-called-${a.id_antrian}`,
                icon: "bell",
                title: `Antrian A${String(a.nomor_antrian).padStart(3, "0")} dipanggil`,
                subtitle: "Sedang dilayani",
                color: "primary",
              });
            }
          }
        }

        if (verifikasiRes.ok) {
          const forms = (await verifikasiRes.json()) as Array<{
            id: string;
            nama: string;
            tanggal: string;
          }>;
          for (const f of (forms ?? []).slice(0, 3)) {
            acts.push({
              id: `form-${f.id}`,
              icon: "user-plus",
              title: `Pasien ${f.nama} daftar`,
              subtitle: f.tanggal,
              color: "slate",
            });
          }
        }

        setActivities(acts.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const totalVisits = stats.weeklyStats.reduce((sum, d) => sum + d.pasien, 0);

  const statCards: StatCardDef[] = [
    {
      label: "Pending Verifikasi",
      value: String(stats.pendingVerifikasi),
      badge: "+12%",
      icon: UserPlus,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Antrian Aktif",
      value: String(stats.antrianHariIni),
      badge: "+5%",
      icon: Clock,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Pendapatan Hari Ini",
      value: formatRupiah(stats.pendapatan),
      badge: "+8.2%",
      icon: Banknote,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Kunjungan Selesai",
      value: String(stats.pasienHariIni),
      badge: "+15%",
      icon: CheckCircle2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-72 bg-muted rounded-xl" />
            <div className="h-4 w-48 bg-muted rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-48 bg-muted rounded-xl" />
            <div className="h-10 w-36 bg-muted rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded-xl" />
          <div className="h-80 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Ringkasan Hari Ini
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Klinik Sehat Selalu • Dashboard Utama
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <CalendarDays className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground">{todayDisplay}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Unduh Laporan
          </button>
        </div>
      </header>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${GLASS} p-6 rounded-xl flex flex-col gap-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {card.label}
              </p>
              <h3 className="text-3xl font-bold mt-1 text-foreground">
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2:1 Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className={`lg:col-span-2 ${GLASS} p-8 rounded-xl flex flex-col gap-6`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Grafik Kunjungan Mingguan
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-primary">
                  {totalVisits} Total
                </span>
                <span className="text-emerald-500 text-sm font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-4 h-4" />
                  14%
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setChartRange("7")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  chartRange === "7"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "text-slate-400 dark:text-slate-500 border-transparent hover:text-foreground"
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartRange("30")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  chartRange === "30"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "text-slate-400 dark:text-slate-500 border-transparent hover:text-foreground"
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>

          {stats.weeklyStats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-64 text-sm text-muted-foreground">
              Belum ada data kunjungan minggu ini.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.weeklyStats}
                  barGap={4}
                  margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hari"
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(100,116,139,0.2)",
                      backgroundColor: "white",
                      color: "#0f172a",
                      fontSize: "13px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    }}
                    formatter={(value) => [`${value} pasien`, "Kunjungan"]}
                    labelStyle={{ fontWeight: 700 }}
                    cursor={{ fill: "rgba(19,55,236,0.05)" }}
                  />
                  <Bar dataKey="pasien" name="Pasien" radius={[4, 4, 0, 0]}>
                    {stats.weeklyStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.hari === todayShort
                            ? "#1337ec"
                            : "rgba(100,116,139,0.25)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Aktivitas Terkini */}
        <div className={`${GLASS} p-8 rounded-xl flex flex-col gap-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Aktivitas Terkini
            </h2>
            <button className="text-slate-400 hover:text-foreground transition-colors p-1">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
              <Bell className="w-10 h-10 opacity-30" />
              <p className="text-sm text-center">
                Belum ada aktivitas hari ini.
              </p>
            </div>
          ) : (
            <div className="relative flex-1">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700/50" />
              <div className="space-y-0">
                {activities.map((act, i) => (
                  <div
                    key={act.id}
                    className={`relative flex gap-4 ${
                      i < activities.length - 1 ? "pb-7" : ""
                    }`}
                  >
                    <div
                      className={`z-10 mt-1 h-6 w-6 shrink-0 rounded-full flex items-center justify-center ring-4 ring-background transition-transform hover:scale-110 ${
                        act.color === "emerald"
                          ? "bg-emerald-500"
                          : act.color === "primary"
                          ? "bg-primary"
                          : "bg-slate-400 dark:bg-slate-600"
                      }`}
                    >
                      {act.icon === "check" && (
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      )}
                      {act.icon === "bell" && (
                        <Bell className="w-3 h-3 text-white" />
                      )}
                      {act.icon === "user-plus" && (
                        <UserPlus className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="font-bold text-foreground text-sm leading-snug">
                        {act.title}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/admin/verifikasi")}
            className="w-full py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/30 rounded-xl transition-all text-slate-600 dark:text-slate-300 mt-auto"
          >
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/admin/verifikasi",
            icon: ClipboardCheck,
            title: "Verifikasi Pendaftaran",
            desc: "Review dan verifikasi form pasien",
            color: "bg-primary/10 text-primary",
          },
          {
            href: "/admin/jadwal",
            icon: Calendar,
            title: "Kelola Jadwal",
            desc: "Atur jadwal dokter dan perawat",
            color:
              "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
          },
          {
            href: "/admin/laporan",
            icon: BarChart3,
            title: "Laporan Harian",
            desc: "Lihat statistik dan laporan",
            color:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`${GLASS} flex items-center gap-4 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer group`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} shrink-0`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.desc}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
