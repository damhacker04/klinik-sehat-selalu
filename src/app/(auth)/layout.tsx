import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between gradient-hero p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold">
            KS
          </div>
          <span className="text-lg font-bold tracking-tight">
            Klinik Sehat Selalu
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Kesehatan Anda,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Prioritas Kami
            </span>
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Sistem informasi klinik terintegrasi yang memudahkan pendaftaran,
            pemeriksaan, hingga pembayaran dalam satu platform digital.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; 2026 Klinik Sehat Selalu
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold">
              KS
            </div>
            <span className="text-lg font-bold tracking-tight">
              Klinik Sehat Selalu
            </span>
          </Link>
        </div>
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
