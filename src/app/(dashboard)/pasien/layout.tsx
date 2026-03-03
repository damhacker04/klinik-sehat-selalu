"use client";

import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { useUser } from "@/hooks/use-user";
import {
  ClipboardList,
  Clock,
  FileText,
  Home,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/pasien", icon: Home },
  { title: "Profil Saya", href: "/pasien/profil", icon: User },
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
  const { userName, userEmail } = useUser();

  return (
    <>
      <AppSidebar
        navItems={navItems}
        role="pasien"
        userName={userName}
        userEmail={userEmail}
      />
      <SidebarInset>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
