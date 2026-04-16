import Link from "next/link";
import {
  Stethoscope,
  ArrowRight,
  ShieldPlus,
  Clock,
  Database,
  CreditCard,
  LayoutDashboard
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dashboardRoute = "/pasien";
  let userRole = "";
  if (user) {
    const { data: account } = await supabase
      .from("user_accounts")
      .select("role")
      .eq("id", user.id)
      .single<{ role: string }>();
    const role = account?.role || "pasien";
    userRole = role;
    dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || "/pasien";
  }

  const isLoggedIn = !!user;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#101322] font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600/30 transition-colors duration-300">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-[#1337ec]/20 rounded-full blur-blob pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-blob pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-200/10 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Klinik <span className="text-blue-600 dark:text-blue-500">Sehat Selalu</span></h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 dark:hover:text-blue-500 hover:text-blue-600 transition-colors" href="#beranda">Beranda</a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 dark:hover:text-blue-500 hover:text-blue-600 transition-colors" href="#layanan">Layanan</a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-300 dark:hover:text-blue-500 hover:text-blue-600 transition-colors" href="#tentang-kami">Tentang Kami</a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href={dashboardRoute}
                className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-100 px-4 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">Masuk</Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center"
                >
                  DAFTAR
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-36 pb-32 px-6 hero-gradient transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-center animate-fade-in stagger-children">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 text-blue-700 dark:text-blue-500 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 dark:bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500"></span>
            </span>
            Teknologi Kesehatan Terdepan
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            Pelayanan Kesehatan Modern dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400">Genggaman</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Solusi kesehatan digital yang efisien, terpercaya, dan terintegrasi untuk masa depan Anda yang lebih sehat dan bahagia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href={dashboardRoute}
                className="glow-button bg-blue-600 hover:bg-blue-700 dark:hover:scale-105 text-white px-10 py-5 w-full sm:w-auto rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                BUKA DASHBOARD
                <ArrowRight className="h-6 w-6" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="glow-button bg-blue-600 hover:bg-blue-700 dark:hover:scale-105 text-white px-10 py-5 w-full sm:w-auto rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  DAFTAR SEKARANG
                  <ArrowRight className="h-6 w-6" />
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-5 rounded-2xl text-lg w-full sm:w-auto text-center font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Masuk ke Akun
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Abstract Image Representative */}
        <div className="mt-20 max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 animate-slide-up transition-colors duration-300" style={{ animationDelay: '0.4s' }} data-alt="Futuristic digital health dashboard interface preview">
          <div className="aspect-video w-full bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 dark:from-blue-600/20 dark:via-slate-900 dark:to-indigo-900/30 flex items-center justify-center">
            <ShieldPlus className="text-blue-500/30 w-32 h-32" strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="layanan" className="py-24 px-6 border-t border-slate-200 dark:border-slate-800/50 relative z-10 bg-slate-50 dark:bg-[#101322] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Layanan Unggulan Kami</h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {/* Card 1 */}
            <div className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Clock className="text-blue-600 dark:text-blue-500 w-8 h-8 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Antrian Real-time</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Pantau nomor antrian Anda secara langsung dari mana saja tanpa harus menunggu di lokasi. Hemat waktu berharga Anda.
              </p>
            </div>
            {/* Card 2 */}
            <div className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <Database className="text-emerald-600 dark:text-emerald-500 w-8 h-8 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Medis Terpadu</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Seluruh rekam medis Anda terintegrasi secara aman dalam satu sistem digital yang mudah diakses kapanpun dibutuhkan.
              </p>
            </div>
            {/* Card 3 */}
            <div className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                <CreditCard className="text-amber-600 dark:text-amber-500 w-8 h-8 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pembayaran Otomatis</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Selesaikan transaksi biaya pengobatan secara instan melalui berbagai kanal pembayaran digital yang aman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-blue-50 dark:bg-blue-600/5 relative z-10 border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto glass-card p-12 rounded-[2.5rem] border-blue-200 dark:border-blue-600/20 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Siap Memulai Hidup Sehat?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Bergabunglah dengan ribuan pasien yang telah merasakan kemudahan layanan kesehatan masa depan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link
                href={dashboardRoute}
                className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600/90 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                BUKA DASHBOARD <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600/90 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                DAFTAR SEKARANG <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="tentang-kami" className="border-t border-slate-200 dark:border-slate-800/80 py-12 px-6 bg-slate-50 dark:bg-[#101322] relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-600/20 p-2 rounded-lg">
              <Stethoscope className="text-blue-600 dark:text-blue-500 h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Klinik Sehat Selalu</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors text-sm" href="#">Kebijakan Privasi</Link>
            <Link className="text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors text-sm" href="#">Syarat &amp; Ketentuan</Link>
            <Link className="text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors text-sm" href="#">Bantuan</Link>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; 2026 Klinik Sehat Selalu. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
