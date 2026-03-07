"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface AppSidebarProps {
  navItems: NavItem[];
  role: string;
  userName: string;
  userEmail: string;
}

const roleColorMap: Record<string, { bg: string; text: string; accent: string; avatar: string }> = {
  pasien: {
    bg: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    avatar: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  admin: {
    bg: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    accent: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    avatar: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  },
  perawat: {
    bg: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    avatar: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  dokter: {
    bg: "bg-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    accent: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    avatar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  apoteker: {
    bg: "bg-teal-500",
    text: "text-teal-600 dark:text-teal-400",
    accent: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    avatar: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
  kasir: {
    bg: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    accent: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    avatar: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
};

const roleLabelMap: Record<string, string> = {
  pasien: "Pasien",
  admin: "Administrator",
  perawat: "Perawat",
  dokter: "Dokter",
  apoteker: "Apoteker",
  kasir: "Kasir",
};

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AppSidebar({
  navItems,
  role,
  userName,
  userEmail,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const colors = roleColorMap[role] || roleColorMap.pasien;

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <Sidebar className="print:hidden">
      <SidebarHeader className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold shadow-sm",
              colors.bg
            )}
          >
            KS
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">
              Klinik Sehat Selalu
            </p>
            <Badge
              variant="outline"
              className={cn("mt-0.5 text-[10px] font-semibold px-2 py-0", colors.accent)}
            >
              {roleLabelMap[role] || role}
            </Badge>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        isActive && colors.accent
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-4 w-4", isActive && colors.text)} />
                        <span className={cn("font-medium", isActive && colors.text)}>
                          {item.title}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <Badge
                            className={cn(
                              "ml-auto h-5 min-w-5 justify-center rounded-full text-[10px] font-bold px-1.5",
                              colors.bg,
                              "text-white border-0"
                            )}
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-9 w-9", colors.avatar)}>
            <AvatarFallback className={cn("text-xs font-bold", colors.avatar)}>
              {(userName || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Keluar"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
