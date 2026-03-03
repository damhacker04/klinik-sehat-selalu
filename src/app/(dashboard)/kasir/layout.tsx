"use client";

import { SidebarInset } from "@/components/ui/sidebar";
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
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
