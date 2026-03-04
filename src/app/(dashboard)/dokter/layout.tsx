"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { useUser } from "@/hooks/use-user";
import {
  Home,
  Stethoscope,
  FileText,
  Pill,
  CalendarCheck,
  Calendar,
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dokter", icon: Home },
  { title: "Pemeriksaan", href: "/dokter/pemeriksaan", icon: Stethoscope },
  { title: "Rekam Medis", href: "/dokter/rekam-medis", icon: FileText },
  { title: "Resep & Rujukan", href: "/dokter/resep", icon: Pill },
  { title: "Kontrol Lanjutan", href: "/dokter/kontrol", icon: CalendarCheck },
  { title: "Jadwal", href: "/dokter/jadwal", icon: Calendar },
];

export default function DokterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userName, userEmail } = useUser();

  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="dokter"
        userName={userName}
        userEmail={userEmail}
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
