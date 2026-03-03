"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { useUser } from "@/hooks/use-user";
import {
  Home,
  ClipboardCheck,
  Clock,
  Calendar,
  BarChart3,
  Users,
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: Home },
  { title: "Verifikasi", href: "/admin/verifikasi", icon: ClipboardCheck },
  { title: "Antrian", href: "/admin/antrian", icon: Clock },
  { title: "Jadwal", href: "/admin/jadwal", icon: Calendar },
  { title: "Laporan", href: "/admin/laporan", icon: BarChart3 },
  { title: "Pengguna", href: "/admin/pengguna", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userName, userEmail } = useUser();

  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="admin"
        userName={userName}
        userEmail={userEmail}
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
