"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Pill,
  Calendar,
  Receipt,
  AlertTriangle,
  CheckCheck,
  MoreVertical,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType =
  | "antrian"
  | "resep_ready"
  | "pembayaran_done"
  | "kontrol_reminder"
  | "stok_menipis";

interface Notif {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: NotifType | null;
  status: "pending" | "sent" | "failed";
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  antrian: Bell,
  resep_ready: Pill,
  kontrol_reminder: Calendar,
  pembayaran_done: Receipt,
  stok_menipis: AlertTriangle,
};

const GLASS =
  "bg-white/80 dark:bg-[rgba(35,41,72,0.4)] backdrop-blur-md border border-slate-200/80 dark:border-white/10";

const GLASS_ACTIVE =
  "bg-primary/5 dark:bg-[rgba(19,55,236,0.15)] backdrop-blur-xl border border-primary/30 dark:border-primary/30";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const mins = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 60_000
  );
  if (mins < 2) return "Baru Saja";
  if (mins < 60) return `${mins} Menit Lalu`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} Jam Lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Kemarin";
  return `${d} Hari Lalu`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotifSkeleton() {
  return (
    <div
      className={`${GLASS} rounded-xl p-5 flex items-start gap-4 animate-pulse`}
    >
      <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-72 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700 mt-1" />
      </div>
      <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  unread,
  onMarkRead,
}: {
  notif: Notif;
  unread: boolean;
  onMarkRead: (id: string) => void;
}) {
  const Icon: LucideIcon = ICON_MAP[notif.type ?? ""] ?? Stethoscope;

  return (
    <div
      className={`
        rounded-xl p-5 flex items-start justify-between gap-4
        ${unread ? GLASS_ACTIVE : GLASS}
        ${
          unread
            ? "hover:translate-x-1"
            : "hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
        }
        transition-all duration-200 cursor-default
        ${!unread ? "opacity-90" : ""}
      `}
    >
      {/* Left: icon + text */}
      <div className="flex gap-4 min-w-0">
        {/* Icon badge */}
        <div
          className={`
            flex items-center justify-center rounded-lg shrink-0 w-12 h-12
            ${
              unread
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-primary/20 dark:bg-primary/20 text-primary"
            }
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Text content */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`
                text-slate-900 dark:text-slate-100 text-lg leading-tight truncate
                ${unread ? "font-bold" : "font-semibold opacity-90"}
              `}
            >
              {notif.title}
            </h3>
            {unread && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
            {notif.message}
          </p>
          <p
            className={`text-xs mt-1 ${
              unread
                ? "text-primary font-bold uppercase tracking-tight"
                : "text-slate-500 italic"
            }`}
          >
            {relativeTime(notif.created_at)}
          </p>
        </div>
      </div>

      {/* Right: action */}
      <div className="shrink-0 pt-0.5">
        {unread ? (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Tandai telah dibaca"
            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        ) : (
          <span className="text-slate-400 p-1 block">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyNotif() {
  return (
    <div
      className={`${GLASS} rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Bell className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">
          Belum Ada Notifikasi
        </h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          Notifikasi tentang antrian, resep, dan pengingat kontrol akan muncul
          di sini.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/pasien/notifikasi");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const isUnread = (n: Notif) =>
    n.status === "pending" && !readIds.has(n.id);

  const unreadCount = notifications.filter(isUnread).length;

  const markAll = () => setReadIds(new Set(notifications.map((n) => n.id)));

  const markOne = (id: string) =>
    setReadIds((prev) => new Set([...prev, id]));

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-primary/20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Stethoscope className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Klinik Sehat Selalu
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Pusat Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAll}
            className="group flex items-center gap-2 text-primary text-sm font-semibold transition-all hover:opacity-70 shrink-0"
          >
            <span className="group-hover:underline">
              Tandai Semua Telah Dibaca
            </span>
            <CheckCheck className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* ── Notification list ── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <NotifSkeleton />
            <NotifSkeleton />
            <NotifSkeleton />
          </>
        ) : notifications.length === 0 ? (
          <EmptyNotif />
        ) : (
          notifications.map((notif) => (
            <NotifCard
              key={notif.id}
              notif={notif}
              unread={isUnread(notif)}
              onMarkRead={markOne}
            />
          ))
        )}
      </div>

      {/* ── Load more — only visible when hitting the API 50-item limit ── */}
      {!loading && notifications.length >= 50 && (
        <div className="flex justify-center">
          <button className="px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/20 transition-all active:scale-95">
            Muat Notifikasi Lama
          </button>
        </div>
      )}
    </div>
  );
}
