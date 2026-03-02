"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  roleColor?: string;
  className?: string;
}

const roleColorMap: Record<string, string> = {
  pasien: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  admin: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  perawat: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  dokter: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  apoteker: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  kasir: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  roleColor = "pasien",
  className,
}: StatCardProps) {
  const colorClass = roleColorMap[roleColor] || roleColorMap.pasien;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.value >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
