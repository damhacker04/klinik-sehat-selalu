"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import {
  ClipboardList,
  Clock,
  FileText,
  Home,
  MessageSquare,
  Bell,
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/pasien", icon: Home },
  { title: "Pendaftaran", href: "/pasien/pendaftaran", icon: ClipboardList },
  { title: "Antrian", href: "/pasien/antrian", icon: Clock },
  { title: "Riwayat Medis", href: "/pasien/riwayat", icon: FileText },
  { title: "Notifikasi", href: "/pasien/notifikasi", icon: Bell },
  { title: "Feedback", href: "/pasien/feedback", icon: MessageSquare },
];

export default function PasienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="Pasien"
        userName="Pasien"
        userEmail=""
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
