"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import {
  ArrowRight,
  Wallet,
  LayoutGrid,
  UserCog,
  Stethoscope,
  FileText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
  Receipt,
} from "lucide-react";

interface PasienStats {
  totalKunjungan: number;
  totalFeedback: number;
  pendaftaranStatus: string | null;
  nomorAntrian: number | null;
  antrianStatus: string | null;
}

export default function PasienDashboard() {
  const { userName } = useUser();
  const [stats, setStats] = useState<PasienStats>({
    totalKunjungan: 0,
    totalFeedback: 0,
    pendaftaranStatus: null,
    nomorAntrian: null,
    antrianStatus: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("/api/pasien/stats");
        if (statsRes.ok) setStats(await statsRes.json());
        // Currently skipping notification mapping as the design has a different flow,
        // but we can reintegrate it later if needed.
      } catch (err) {
        console.error("Failed to fetch pasien data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "Pasien";
    return fullName.split(" ")[0];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in font-display">
      {/* Welcome Section */}
      <section className="mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-slate-900 dark:text-slate-100">
          Selamat Pagi, {getFirstName(userName)}! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Semoga hari Anda menyenangkan dan sehat selalu.
        </p>
      </section>

      {/* Main Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Queue Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group dark:bg-slate-900/40">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Kartu Antrian Hari Ini
              </span>
              {stats.antrianStatus === "called" ? (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold border border-green-500/20">
                  <span className="h-2 w-2 rounded-full bg-green-500 pulse-green"></span>
                  Dipanggil
                </span>
              ) : stats.antrianStatus === "waiting" ? (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-500/20">
                  Menunggu
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold border border-slate-500/20">
                  Tidak Terdaftar
                </span>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-5xl font-black mb-1 text-slate-900 dark:text-white">
                {loading ? "..." : stats.nomorAntrian ? `A${String(stats.nomorAntrian).padStart(3, "0")}` : "-"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {stats.pendaftaranStatus ? `Status: ${stats.pendaftaranStatus}` : "Belum ada kunjungan"}
              </p>
            </div>
          </div>
          <Link
            href="/pasien/antrian"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Buka Antrian
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Billing Card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 dark:bg-slate-900/40">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Status Tagihan Medis
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
                Cek Riwayat
              </span>
            </div>
            <div className="mb-6">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Total Kunjungan
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : stats.totalKunjungan} Kali
              </h3>
            </div>
          </div>
          <Link
            href="/pasien/tagihan"
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Lihat Tagihan Saya
            <Wallet className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Menu Bento Grid */}
      <section>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          Menu Cepat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Profile Item */}
          <Link href="/pasien/profil" className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-slate-900/40">
            <div className="mb-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <UserCog className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Profil</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Update data diri</p>
          </Link>

          {/* Registration Item */}
          <Link href="/pasien/pendaftaran" className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-slate-900/40">
            <div className="mb-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pendaftaran</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Konsultasi dokter</p>
          </Link>

          {/* History Item */}
          <Link href="/pasien/riwayat" className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group dark:bg-slate-900/40">
            <div className="mb-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <FileText className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Rekam medis Anda</p>
          </Link>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="mt-10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Sekilas Informasi Visual
        </h3>
        <div className="glass rounded-2xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300 dark:bg-slate-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar View Placeholder (Decorative) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Bulan Ini</h4>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">Min</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Sen</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Sel</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Rab</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Kam</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Jum</div>
                <div className="text-xs font-bold text-slate-500 uppercase">Sab</div>

                <div className="p-2 text-slate-400 dark:text-slate-600">28</div>
                <div className="p-2 text-slate-400 dark:text-slate-600">29</div>
                <div className="p-2 text-slate-400 dark:text-slate-600">30</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">1</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">2</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">3</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">4</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">5</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">6</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">7</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">8</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">9</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">10</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">11</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">12</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">13</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">14</div>
                <div className="p-2 bg-blue-600 text-white rounded-lg font-bold relative shadow-lg shadow-blue-500/20">
                  15
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-white rounded-full"></span>
                </div>
                <div className="p-2 text-slate-700 dark:text-slate-300">16</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">17</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">18</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">19</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">20</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">21</div>
                <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg font-bold relative">
                  22
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                </div>
                <div className="p-2 text-slate-700 dark:text-slate-300">23</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">24</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">25</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">26</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">27</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">28</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">29</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">30</div>
                <div className="p-2 text-slate-700 dark:text-slate-300">31</div>
              </div>
            </div>

            {/* Appointment Details (Illustrative) */}
            <div className="flex flex-col gap-4 border-l border-slate-200 dark:border-slate-800 pl-0 lg:pl-8 pt-8 lg:pt-0">
              <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Detail Kunjungan (Ilustrasi)
              </h4>
              <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Hari ini</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white">Pemeriksaan Rutin</h5>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ayo pastikan Anda datang tepat waktu.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-xl p-4 opacity-70">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bulan Depan</span>
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white">Kontrol Lanjutan</h5>
                <p className="text-sm text-slate-500 dark:text-slate-400">Akan dijadwalkan oleh dokter Anda.</p>
              </div>
              <Link
                href="/pasien/pendaftaran"
                className="mt-auto text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center gap-2 py-3 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                Buat Janji Baru
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Services (Bento Expansion) */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition-all dark:bg-slate-900/40">
          <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 shadow-inner">
            <img
              alt="Telemedicine"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1576091160550-2173ff9e5eb3?auto=format&fit=crop&q=80&w=200&h=200"
            />
          </div>
          <div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Dukungan Medis</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Layanan kami akan terus berkembang.</p>
            <Link className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 hover:underline" href="/pasien/pendaftaran">
              Daftar kunjungan sekarang <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition-all dark:bg-slate-900/40">
          <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 shadow-inner">
            <img
              alt="Pharmacy"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=200&h=200"
            />
          </div>
          <div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Informasi Tagihan</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Simpan bukti tagihan secara digital.</p>
            <Link className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 hover:underline" href="/pasien/tagihan">
              Riwayat Transaksi <Receipt className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
