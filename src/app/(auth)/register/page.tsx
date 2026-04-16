"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { PasswordInput } from "@/components/shared/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle2, Stethoscope, Mail, Lock, User, IdCard, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama: "",
      email: "",
      nik: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          nama: data.nama,
          nik: data.nik,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Terjadi kesalahan saat mendaftar");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden bg-slate-50 dark:bg-[#101322]">
      {/* Absolute Theme Toggle for Convenience */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600/10 dark:bg-blue-600/5 backdrop-blur-3xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay dark:opacity-40 animate-fade-in"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0_zJjbqwOGgtTJ-vnY-PFq9E0rdEWDmrfYEbZlMM6eQskXUFa2L-Y61lBR7Bqz4QL6rJ5u3mbaeSpNkP4XwdvxabD19tN3bDjL4lCNfqs8BstjhkOdLTZf-QYgo3XRs6WucehDFNoeXQ6u37vdsMzNKHHGI_0BW1a4x1wGw3tHs9b-1nLOP7L-kWPm1J6m2WCfJ9jafldwmffrGIndlLcm6D-Plu3FoPQEcZVr7n2Z2U5aK7KJGTlbdb7osSQvTTjNEt0im5bA2Q')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101322] via-[#101322]/60 to-transparent dark:from-[#101322] dark:via-[#101322]/80 dark:to-transparent/20"></div>
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-xl shadow-blue-600/20 text-white">
              <Stethoscope className="text-white h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-md">Klinik Sehat Selalu</h1>
          </Link>
          <div className="max-w-md animate-slide-up">
            <h2 className="text-5xl font-extrabold leading-tight text-white dark:text-white mb-6 drop-shadow-lg">
              Bergabunglah dengan komunitas kesehatan kami hari ini.
            </h2>
            <p className="text-xl text-slate-200 dark:text-slate-300 drop-shadow">
              Akses layanan medis kelas dunia, rekam medis digital, dan pemesanan janji temu yang lancar.
            </p>
          </div>
          <div className="flex gap-4 items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex -space-x-3">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5fzAp6TjT7AE989KCbDn1YMsSyH6UWfUNvXEHgmVu9jtc3dNrsel166yNc3iQPmK1be3U6Wn2Od4BOrf39Mt2Q4w3TarjpReuTb5tfVPwbWI6i9VZhzsuhwep1RI9ecC3GHzDpBwfbsQyD-I9TKfnSzJUQy_Vt4dTOb2QjIweH5tH16dB7QWiG2ZuP6oK_JzopyJuSJa0_VdzXDR1l8T3b27n7jjnztSopi-7O5GMt3Uw4a4jYpKUjgOHdxgeAEUxDsrnHHro56E"
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-[#101322] object-cover"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_-ykux1REq1Bf8a7Z34tPeGfSUxeLnTbyuQQrvMUv-2bbTz83UgOknrnceyOKGipQCh8D5OFO2LQxWJlUTYbSat2kvy1fo6JUo6bpFuEU6cehDZ9l7TdcfzFF_0_laeuF-RXOYCQHWA8H7z52Rxy0dY7mM3T0hJok8vDj8DIKbwTmQFeb1fwo-2LA5CYkgDxNBbukZsdOVI9ArdaFHx3O9lIo2BIqVa6w7ripCZzT9ZWf-Tht7rbR85LO6d5ER3eFEorpCWzrwy8"
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-[#101322] object-cover"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUte0_BbpSV4qcq7qjGiatBpWxmVxGGiDrVbD3EF6GwVLq0iTuvpQOfMA7Q1i7Th9ua9fs5FfCgBI3pqytqI17OQvLBOeGsNAp9-bsrp8zLbMXVvU7mCcxT7DG31do_baS58LKfcCh70CfSybSoZS4oDqjhLx9ItE1tGVuDHJZ4VK-IFeb-oM5BXhZU0ujfGCziL1a8gEdSQXa67TUrIQcylPJZ9N3E6ZNqYS4ZElqOp90gVRLV1J4-q03hjDelTYvcgi3hDXOAsA"
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-slate-100 dark:border-[#101322] object-cover"
              />
            </div>
            <p className="text-sm text-slate-300 dark:text-slate-400 self-center font-medium drop-shadow">
              Dipercaya oleh <span className="text-white font-bold">10.000+</span> pasien aktif.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 h-screen overflow-y-auto custom-scrollbar backdrop-blur-xl transition-colors duration-500">
        <div className="w-full max-w-md my-auto pb-12 pt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="lg:hidden flex items-center gap-3 mb-10 w-fit">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Klinik Sehat Selalu</h1>
            </Link>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Daftar Akun Baru
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Lengkapi formulir di bawah ini untuk menjadi pasien terdaftar.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 text-sm text-red-700 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem className="space-y-2 group">
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Nama Lengkap
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="Budi Santoso"
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
                name="nik"
                render={({ field }) => (
                  <FormItem className="space-y-2 group">
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Nomor Induk Kependudukan (NIK)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <input
                          type="text"
                          maxLength={16}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="16 digit angka NIK"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2 group">
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Alamat Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <input
                          type="email"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="nama@email.com"
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
                  <FormItem className="space-y-2 group">
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Kata Sandi
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 z-10 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <PasswordInput
                          placeholder="Minimal 8 karakter"
                          className="w-full pl-12 pr-12 py-4 h-auto rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2 group">
                    <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Konfirmasi Kata Sandi
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 z-10 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                        <PasswordInput
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-12 pr-12 py-4 h-auto rounded-xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-3 py-4 pl-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 bg-white dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer pr-4">
                  Saya menyetujui {" "}
                  <a href="#" className="font-bold text-blue-600 dark:text-blue-500 hover:underline transition-all">Syarat Layanan</a>{" "}
                  dan {" "}
                  <a href="#" className="font-bold text-blue-600 dark:text-blue-500 hover:underline transition-all">Kebijakan Privasi</a>.
                </label>
              </div>

              <div className="animate-slide-up">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-[#101322] transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
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
                Atau daftar dengan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              className="group flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              title="Fitur Register Otomatis Google belum tersedia."
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
              title="Fitur Register Otomatis Facebook belum tersedia."
            >
              <svg className="h-5 w-5 text-[#1877F2] mr-3 group-hover:-translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook</span>
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-500 hover:underline transition-all inline-flex items-center gap-1"
              >
                Kembali ke Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
