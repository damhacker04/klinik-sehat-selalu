"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { Home, Activity, FileText, StickyNote } from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/perawat", icon: Home },
  { title: "Pemeriksaan Awal", href: "/perawat/pemeriksaan", icon: Activity },
  { title: "Riwayat Pasien", href: "/perawat/riwayat", icon: FileText },
  { title: "Catatan", href: "/perawat/catatan", icon: StickyNote },
];

export default function PerawatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="Perawat"
        userName="Perawat"
        userEmail=""
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
