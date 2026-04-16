"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
  CreditCard,
} from "lucide-react";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/pasien", icon: Home },
  { title: "Profil Saya", href: "/pasien/profil", icon: User },
  { title: "Pendaftaran", href: "/pasien/pendaftaran", icon: ClipboardList },
  { title: "Antrian", href: "/pasien/antrian", icon: Clock },
  { title: "Riwayat Medis", href: "/pasien/riwayat", icon: FileText },
  { title: "Tagihan Saya", href: "/pasien/tagihan", icon: CreditCard },
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
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <SidebarTrigger className="size-8" />
          <span className="text-sm font-bold tracking-tight">Klinik Sehat Selalu</span>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}
