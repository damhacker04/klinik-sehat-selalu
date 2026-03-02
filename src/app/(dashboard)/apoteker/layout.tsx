"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { Home, Pill, Package, AlertTriangle, ShoppingCart } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/apoteker", icon: Home },
  { title: "Resep Masuk", href: "/apoteker/resep", icon: Pill },
  { title: "Stok Obat", href: "/apoteker/stok", icon: Package },
  { title: "Stok Menipis", href: "/apoteker/stok-menipis", icon: AlertTriangle },
  { title: "Pengadaan", href: "/apoteker/pengadaan", icon: ShoppingCart },
];

export default function ApotekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="apoteker"
        userName="Apoteker"
        userEmail="apoteker@klinik.com"
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
