import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40">
      <div className="text-center space-y-6 px-4">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
            KS
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Klinik Sehat Selalu
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Sistem informasi terintegrasi untuk pelayanan medis digital yang
            efisien dan terpercaya
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
