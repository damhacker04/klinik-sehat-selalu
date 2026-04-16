"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2, HeartPulse } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: PasswordResetRequestInput) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/confirm`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden bg-slate-50 dark:bg-[#101322]">
      {/* Absolute Theme Toggle for Convenience */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900">
        <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-900/40 mix-blend-multiply z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 animate-fade-in"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQqR_E35eLq0c3aO9h_2mE_oE1s-9D2zYrtXlyr3Xz2H9d6-5tYkVwG7Zc4v8fJ5jT9_M1Z2rIxbkVN9Z6b3Z2rIxbkVN9Z6b3YkVwG7Zc4v8fJ5jT9_M1YkVwG7Zc4v8fJ5jT9_M1YkVwG7Zc4v8fJ5jT9_M1YkVwG7Zc4v8fJ5jT9')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-transparent to-transparent opacity-80 z-20"></div>

        <div className="relative z-30 flex flex-col justify-between p-16 w-full h-full text-white">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
              <HeartPulse className="h-8 w-8 text-blue-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Klinik Sehat Selalu</span>
          </Link>

          <div className="max-w-md animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Keamanan Terjamin
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Kesehatan Anda, <br /><span className="text-blue-300">Prioritas Kami.</span>
            </h1>
            <p className="text-blue-100/80 text-lg leading-relaxed">
              Sistem perlindungan data rekam medis bersertifikasi. Kami memastikan setiap informasi pasien tersimpan dengan aman dan rahasia.
            </p>
          </div>

          <div className="text-sm text-blue-200/60 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            &copy; 2026 Klinik Sehat Selalu. Sistem Manajemen Pasien.
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-[#101322] transition-colors duration-500">
        <div className="max-w-md w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>

          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="bg-blue-600 p-2 rounded-lg">
              <HeartPulse className="text-white h-6 w-6" />
            </div>
            <span className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Klinik Sehat Selalu</span>
          </div>

          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors mb-6 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Lupa Kata Sandi? 🔒
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed">
              Jangan khawatir! Masukkan alamat email yang terdaftar, dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi Anda.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 text-center mt-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800/50 mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">Email Terkirim!</h3>
              <p className="text-emerald-600 dark:text-emerald-400/80 text-sm mb-6">
                Silakan periksa kotak masuk email Anda (termasuk folder spam) untuk tautan pengaturan ulang kata sandi.
              </p>
              <Link
                href="/login"
                className="inline-flex justify-center items-center w-full py-3 px-4 text-sm font-bold rounded-xl text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-100 dark:bg-emerald-800 dark:hover:bg-emerald-700 transition-colors"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="group space-y-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Alamat Email Terdaftar
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input
                            type="email"
                            placeholder="nama@email.com"
                            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1" />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-4 px-4 text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-[#101322] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {loading ? "MENGIRIM..." : "KIRIM TAUTAN RESET"}
                  </button>
                </div>

                <div className="text-center mt-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Masalah saat login? Hubungi <a href="#" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">dukungan teknis</a>.
                  </p>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
