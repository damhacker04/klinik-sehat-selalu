import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  FileText,
  Pill,
  CreditCard,
  Bell,
  Heart,
  Shield,
  Users,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Pendaftaran Online",
    description: "Daftar kunjungan dari mana saja tanpa perlu antri di lokasi",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    icon: Clock,
    title: "Antrian Real-time",
    description: "Pantau posisi antrian Anda secara langsung dari perangkat",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    icon: FileText,
    title: "Rekam Medis Digital",
    description: "Akses riwayat medis lengkap kapan saja dengan aman",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    icon: Pill,
    title: "Farmasi Terintegrasi",
    description: "Resep langsung terkirim ke apotek tanpa risiko kesalahan",
    color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Mudah",
    description: "Bayar dengan tunai, transfer, atau kartu dalam satu sistem",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  },
  {
    icon: Bell,
    title: "Notifikasi Pintar",
    description: "Dapatkan pengingat jadwal kontrol dan informasi antrian",
    color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  },
];

const stats = [
  { value: "1,000+", label: "Pasien Terdaftar" },
  { value: "15+", label: "Tenaga Medis" },
  { value: "50+", label: "Layanan Harian" },
  { value: "4.8", label: "Rating Kepuasan" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold">
              KS
            </div>
            <span className="text-lg font-bold tracking-tight">
              Klinik Sehat Selalu
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Pelayanan Kesehatan Digital Terpercaya</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Kesehatan Anda,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                Prioritas Kami
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Sistem informasi klinik terintegrasi yang memudahkan pendaftaran,
              pemeriksaan, hingga pembayaran. Semua dalam satu platform digital.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8"
                >
                  Sudah Punya Akun
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 stagger-children">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold tracking-tight text-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Layanan Lengkap dalam Satu Platform
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Dari pendaftaran hingga pembayaran, semua proses klinik terintegrasi
              secara digital
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="font-semibold">Data Terenkripsi</p>
                <p className="text-sm text-muted-foreground">
                  Keamanan data pasien terjamin
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Multi-Role</p>
                <p className="text-sm text-muted-foreground">
                  6 role pengguna terintegrasi
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-semibold">24/7 Akses</p>
                <p className="text-sm text-muted-foreground">
                  Akses sistem kapan saja
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                KS
              </div>
              <span className="text-sm font-semibold">
                Klinik Sehat Selalu
              </span>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">
                Jam Operasional: Senin - Sabtu, 08:00 - 17:00
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                &copy; 2026 Klinik Sehat Selalu. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
