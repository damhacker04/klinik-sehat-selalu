"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "pending"
  | "verified"
  | "rejected"
  | "waiting"
  | "called"
  | "done"
  | "processing"
  | "completed"
  | "draft"
  | "paid"
  | "failed"
  | "cancelled"
  | "active"
  | "inactive"
  | "suspended"
  | "sent"
  | "approved"
  | "ordered"
  | "received";

const statusConfig: Record<
  StatusVariant,
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  verified: {
    label: "Terverifikasi",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  waiting: {
    label: "Menunggu",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  called: {
    label: "Dipanggil",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  done: {
    label: "Selesai",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  processing: {
    label: "Diproses",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  completed: {
    label: "Selesai",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800",
  },
  paid: {
    label: "Lunas",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  failed: {
    label: "Gagal",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800",
  },
  active: {
    label: "Aktif",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  inactive: {
    label: "Nonaktif",
    className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800",
  },
  suspended: {
    label: "Ditangguhkan",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  sent: {
    label: "Terkirim",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  approved: {
    label: "Disetujui",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  ordered: {
    label: "Dipesan",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  received: {
    label: "Diterima",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
};

interface StatusBadgeProps {
  status: StatusVariant;
  customLabel?: string;
  className?: string;
}

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2.5 py-0.5",
        config.className,
        className
      )}
    >
      {customLabel || config.label}
    </Badge>
  );
}
