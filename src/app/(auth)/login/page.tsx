"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";
import { PasswordInput } from "@/components/shared/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle2, Stethoscope, Mail, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        setError("Email belum dikonfirmasi. Cek inbox email Anda dan klik link konfirmasi.");
      } else {
        setError("Email atau password salah");
      }
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: account } = await supabase
        .from("user_accounts")
        .select("role")
        .eq("id", user.id)
        .single<{ role: string }>();

      const role = account?.role || "pasien";
      router.push(ROLE_DASHBOARD_ROUTES[role] || "/pasien");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden">
      {/* Absolute Theme Toggle for Convenience */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#101322]">
        <div className="absolute inset-0 mesh-gradient"></div>
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 animate-fade-in"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmOqtWiGnyuV86K8a5k0BNGMN0mhAYielS3EKIAdFUejSzgA7SKIvKyWWAj9Q2J053ISBWtu4IKKE3deWybpn_tsjm_4pWAk-To4Qj8gJyubSybwb8hFRXLqPt492eBKtD_gnCM48FQnXE-5stJ9IYntosTjEeHcWqO09JsG_H_YR-GPK_c7AzxAawQa3EhSt9ILMbwIYR-18Hyth0aiHpnJm2XWo9lpoDZN9Aw0dfBfvnEMTgv4Y_9lhoVxDtLScmK7EjYRmK0xc')",
          }}
        ></div>
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="text-white h-8 w-8" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Klinik Sehat Selalu</span>
          </Link>
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Solusi Kesehatan Terpercaya di Genggaman Anda.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Kelola janji temu, akses rekam medis, dan konsultasi dengan dokter terbaik kami secara mudah dan cepat.
            </p>
          </div>
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex-1">
              <p className="text-blue-500 dark:text-blue-400 font-bold text-2xl">10k+</p>
              <p className="text-slate-400 text-sm">Pasien Aktif</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex-1">
              <p className="text-blue-500 dark:text-blue-400 font-bold text-2xl">50+</p>
              <p className="text-slate-400 text-sm">Dokter Spesialis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-[#101322] transition-colors duration-500 overflow-y-auto">
        <div className="max-w-md w-full space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="text-white h-6 w-6" />
            </div>
            <span className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Klinik Sehat Selalu</span>
          </div>

          <div className="animate-slide-up">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Selamat Datang Kembali! 👋
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Silakan masuk ke akun Anda untuk melanjutkan akses layanan kami.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="animate-slide-up">
                {justRegistered && !error && (
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 text-sm text-emerald-700 dark:text-emerald-400 mb-6">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-base mb-1">Pendaftaran berhasil!</p>
                      <p className="text-emerald-600 dark:text-emerald-500/80">
                        Silakan masuk dengan email dan kata sandi yang telah didaftarkan.
                      </p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
                    <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="group space-y-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Alamat Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input
                            type="email"
                            placeholder="nama@email.com"
                            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="group space-y-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Kata Sandi
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          {/* PasswordInput component wraps an <input> and adds the eye toggle on the right natively */}
                          <PasswordInput
                            placeholder="••••••••"
                            className="block w-full pl-12 pr-12 py-4 h-auto bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-300 rounded bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                    Ingat Saya
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/reset-password" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    Lupa Sandi?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-[#101322] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? "MEMPROSES..." : "MASUK KE AKUN"}
                </button>
              </div>
            </form>
          </Form>

          {/* Social Logins - Visual Only based on instructions */}
          <div className="relative mt-8">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 dark:bg-[#101322] text-slate-500 transition-colors duration-500 font-medium">
                Atau masuk dengan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              className="group flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              title="Fitur Login Otomatis Google belum tersedia."
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOjOTIQSt1dtS1MiC19_Bwau2mXtetukbdOfzSecFQsklgt02kaI1hpGjQkYoHDwKVWkqJuMbStk2UQS4ZOh2ze3Pz9z9XzicjMN8G00sWr9oHm1DS-lJT2mmT74CZNQsAmdWyid19Cl2jtPiqHp2yq-9RPbGGGp1piuz2H7DHx5BfXttxyQ5fGZwGAKnTiv98jg9EidL_-3pztLumUPp9jgPvXyC6CQM8lTDbwcNx2EO9D3_uyxpCoJCQpkoopcCLoTOfsPyPnu4"
                alt="Google"
                className="h-5 w-5 mr-3 group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
            </button>
            <button
              type="button"
              className="group flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              title="Fitur Login Otomatis Facebook belum tersedia."
            >
              <svg className="h-5 w-5 text-[#1877F2] mr-3 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook</span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-500 hover:underline transition-all"
            >
              Daftar Sekarang
            </Link>
          </p>
          <div className="pt-8 pb-4 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © 2026 Klinik Sehat Selalu. Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
