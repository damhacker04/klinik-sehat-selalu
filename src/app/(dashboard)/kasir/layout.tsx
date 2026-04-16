"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { useUser } from "@/hooks/use-user";
import { Home, Receipt, CreditCard, FileText } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/kasir", icon: Home },
  { title: "Transaksi", href: "/kasir/transaksi", icon: CreditCard },
  { title: "Riwayat", href: "/kasir/riwayat", icon: FileText },
  { title: "Bukti Bayar", href: "/kasir/bukti", icon: Receipt },
];

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userName, userEmail } = useUser();

  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="kasir"
        userName={userName}
        userEmail={userEmail}
      />
      <SidebarInset>
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <SidebarTrigger className="size-8" />
          <span className="text-sm font-bold tracking-tight">Klinik Sehat Selalu</span>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
