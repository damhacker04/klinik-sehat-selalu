"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  CreditCard,
  Wallet,
  FileText,
  FileSpreadsheet,
  Search,
  TrendingUp,
  CalendarDays,
  MoreHorizontal,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface LaporanData {
  jumlahPasien: number;
  jumlahTransaksi: number;
  totalPendapatan: number;
  weeklyPasien: { hari: string; pasien: number }[];
  weeklyPendapatan: { hari: string; pendapatan: number }[];
}

interface DailyRow {
  tanggal: string;
  hari: string;
  pasien: number;
  pendapatan: number;
  status: "selesai" | "pending";
}

const GLASS =
  "bg-white/80 dark:bg-[rgba(25,30,51,0.7)] backdrop-blur-md border border-slate-200 dark:border-white/10";
const DIST_COLORS = ["#1337ec", "#10b981"];
const distribusiData = [
  { name: "Kasir", value: 65 },
  { name: "Farmasi", value: 35 },
];

function CustomTooltipCount({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">
        {label}
      </p>
      <p className="text-white text-sm font-bold">{payload[0]?.value} pasien</p>
    </div>
  );
}

function CustomTooltipRupiah({
  active,
  payload,
  label,
  formatter,
}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">
        {label}
      </p>
      <p className="text-white text-sm font-bold">
        {formatter(payload[0]?.value as number)}
      </p>
    </div>
  );
}

export default function LaporanPage() {
  const [data, setData] = useState<LaporanData>({
    jumlahPasien: 0,
    jumlahTransaksi: 0,
    totalPendapatan: 0,
    weeklyPasien: [],
    weeklyPendapatan: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tablePage, setTablePage] = useState(0);

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const periodeStr = `${sevenDaysAgo.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} – ${today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/laporan");
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Failed to fetch laporan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const formatRupiahShort = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}jt`
      : v >= 1_000
      ? `${(v / 1_000).toFixed(0)}rb`
      : String(v);

  // Derive daily table rows from weekly data
  const allDailyRows = useMemo<DailyRow[]>(() => {
    return data.weeklyPasien.map((wp, i) => {
      const wpend = data.weeklyPendapatan[i];
      const d = new Date();
      d.setDate(d.getDate() - (data.weeklyPasien.length - 1 - i));
      const tanggal = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const isToday = i === data.weeklyPasien.length - 1;
      return {
        tanggal,
        hari: wp.hari,
        pasien: wp.pasien,
        pendapatan: wpend?.pendapatan ?? 0,
        status: isToday ? "pending" : "selesai",
      };
    });
  }, [data]);

  const filteredRows = useMemo(
    () =>
      !search
        ? allDailyRows
        : allDailyRows.filter((r) => r.tanggal.includes(search)),
    [allDailyRows, search]
  );

  const PAGE_SIZE = 7;
  const totalTablePages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice(
    tablePage * PAGE_SIZE,
    (tablePage + 1) * PAGE_SIZE
  );
  const totalPeriodePasien = allDailyRows.reduce((s, r) => s + r.pasien, 0);
  const totalPeriodePendapatan = allDailyRows.reduce(
    (s, r) => s + r.pendapatan,
    0
  );

  return (
    <div className="min-h-full space-y-8 bg-slate-50 dark:bg-[#101322] -m-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
            Laporan &amp; Analitik
          </h1>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <CalendarDays className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">Periode: {periodeStr}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors font-semibold text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20 font-semibold text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div
          className={`flex flex-col gap-4 rounded-xl p-6 ${GLASS} shadow-sm hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Pasien Ditangani
            </p>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              data.jumlahPasien
            )}
          </p>
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Selesai hari ini</span>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className={`flex flex-col gap-4 rounded-xl p-6 ${GLASS} shadow-sm hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Transaksi Lunas
            </p>
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              data.jumlahTransaksi
            )}
          </p>
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pembayaran selesai</span>
          </div>
        </div>

        {/* Card 3 — primary */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-primary shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-white/80">
            <p className="text-xs font-bold uppercase tracking-wider">
              Total Pendapatan
            </p>
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-white text-2xl font-bold tracking-tight leading-snug">
            {loading ? (
              <span className="inline-block w-36 h-8 bg-white/20 rounded animate-pulse" />
            ) : (
              formatRupiah(data.totalPendapatan)
            )}
          </p>
          <div className="flex items-center gap-1 text-white/90 text-xs font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>Data terintegrasi realtime</span>
          </div>
        </div>
      </div>

      {/* ── Tren Pendapatan Mingguan ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold leading-tight">
            Tren Pendapatan Mingguan
          </h2>
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-600 dark:text-slate-300">
            <option>7 Hari Terakhir</option>
          </select>
        </div>

        <div className={`p-6 rounded-xl ${GLASS} shadow-sm`}>
          {loading ? (
            <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ) : data.weeklyPendapatan.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.weeklyPendapatan}
                  margin={{ top: 24, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hari"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={
                      <CustomTooltipRupiah formatter={formatRupiah} />
                    }
                    cursor={{ fill: "rgba(19,55,236,0.06)" }}
                  />
                  <Bar dataKey="pendapatan" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {data.weeklyPendapatan.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === data.weeklyPendapatan.length - 1
                            ? "#1337ec"
                            : "rgba(19,55,236,0.22)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <p className="text-sm text-slate-400">Belum ada data pendapatan</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Rincian Keuangan Harian ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold leading-tight">
            Rincian Keuangan Harian
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setTablePage(0);
              }}
              placeholder="Cari tanggal..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 w-52"
            />
          </div>
        </div>

        <div className={`overflow-hidden rounded-xl ${GLASS} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-center">
                    Jumlah Pasien
                  </th>
                  <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-right">
                    Pemasukan
                  </th>
                  <th className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pagedRows.length > 0 ? (
                  pagedRows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/20"
                    >
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm font-medium whitespace-nowrap">
                        {row.tanggal}
                        <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                          ({row.hari})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm text-center">
                        {row.pasien} Pasien
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white text-sm font-bold text-right font-mono whitespace-nowrap">
                        {formatRupiah(row.pendapatan)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.status === "selesai" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      {search
                        ? "Tidak ada data untuk tanggal yang dicari"
                        : "Belum ada data keuangan"}
                    </td>
                  </tr>
                )}
              </tbody>
              {!loading && pagedRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 font-bold">
                    <td className="px-6 py-4 text-slate-900 dark:text-white text-sm">
                      Total Periode
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white text-sm text-center">
                      {totalPeriodePasien} Pasien
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white text-sm text-right font-mono">
                      {formatRupiah(totalPeriodePendapatan)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Pagination info */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <p>
            Menampilkan {pagedRows.length} dari {filteredRows.length} entri harian
          </p>
          {totalTablePages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                disabled={tablePage === 0}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setTablePage((p) => Math.min(totalTablePages - 1, p + 1))
                }
                disabled={tablePage >= totalTablePages - 1}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom 2 Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Trend Kunjungan Pasien */}
        <div className={`p-6 rounded-xl ${GLASS} shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-900 dark:text-white font-bold">
              Trend Kunjungan Pasien
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ) : data.weeklyPasien.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.weeklyPasien}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hari"
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltipCount />}
                    cursor={{ fill: "rgba(19,55,236,0.06)" }}
                  />
                  <Bar dataKey="pasien" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {data.weeklyPasien.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`rgba(19,55,236,${0.2 + (index / Math.max(data.weeklyPasien.length - 1, 1)) * 0.8})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <p className="text-sm text-slate-400">Belum ada data kunjungan</p>
            </div>
          )}
        </div>

        {/* Distribusi Layanan */}
        <div className={`p-6 rounded-xl ${GLASS} shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-900 dark:text-white font-bold">
              Distribusi Layanan
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-8">
            {/* Donut chart with explicit dimensions + center label overlay */}
            <div className="relative shrink-0" style={{ width: 152, height: 152 }}>
              <PieChart width={152} height={152}>
                <Pie
                  data={distribusiData}
                  cx={76}
                  cy={76}
                  innerRadius={48}
                  outerRadius={68}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {distribusiData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DIST_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, "Proporsi"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
              {/* Center overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none">
                    Total
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    100%
                  </p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-3">
              {distribusiData.map((d, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: DIST_COLORS[i] }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {d.name} ({d.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
