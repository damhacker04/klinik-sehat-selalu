"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Send,
  CalendarX,
  CalendarDays,
  ClipboardList,
  Download,
  X,
  StickyNote,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReminderItem {
  id_reminder: number;
  tanggal_kontrol: string;
  status: "pending" | "sent" | "completed";
  id_pasien?: number;
  rekam_medis?: {
    id_rekam?: number;
    pasien?: { nama: string } | null;
    diagnosa: string | null;
    catatan?: string | null;
  } | null;
}

type DateStatus = "overdue" | "today" | "upcoming" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateStatus(tanggal: string, status: string): DateStatus {
  if (status === "completed") return "done";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(tanggal);
  d.setHours(0, 0, 0, 0);
  if (d < today) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return "upcoming";
}

function getRelativeDay(tanggal: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(tanggal);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Hari Ini";
  if (diff === 1) return "Besok";
  if (diff === 2) return "Lusa";
  if (diff < 0) return `${Math.abs(diff)} hari lalu`;
  return `${diff} hari lagi`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const GRADIENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

function getGradient(id: number) {
  return GRADIENT_COLORS[id % GRADIENT_COLORS.length];
}

// ─── Toast Portal ─────────────────────────────────────────────────────────────

function SuccessToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 bg-slate-900 dark:bg-[rgba(20,28,50,0.95)] backdrop-blur-xl border border-emerald-500/40 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/10 min-w-[280px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-sm tracking-wide">Berhasil!</p>
          <p className="text-slate-300 text-xs">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-slate-500 hover:text-white transition-colors p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Date Status Config ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  overdue: {
    border: "border-l-red-500",
    badge: "bg-red-500/10 text-red-500",
    label: "Terlambat",
    dateColor: "text-red-500",
    icon: <CalendarX className="w-4 h-4" />,
  },
  today: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/10 text-amber-500",
    label: "Hari Ini",
    dateColor: "text-amber-500",
    icon: <CalendarDays className="w-4 h-4" />,
  },
  upcoming: {
    border: "border-l-slate-400 dark:border-l-slate-500",
    badge: "bg-slate-500/10 text-slate-400",
    label: "Mendatang",
    dateColor: "text-slate-500 dark:text-slate-400",
    icon: <Clock className="w-4 h-4" />,
  },
  done: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500",
    label: "Selesai",
    dateColor: "text-emerald-500",
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

// ─── Patient Card ─────────────────────────────────────────────────────────────

function PatientCard({
  item,
  onMarkDone,
  onSendReminder,
  loading,
}: {
  item: ReminderItem;
  onMarkDone: (id: number) => void;
  onSendReminder: (id: number) => void;
  loading: boolean;
}) {
  const router = useRouter();
  const dateStatus = getDateStatus(item.tanggal_kontrol, item.status);
  const cfg = STATUS_CONFIG[dateStatus];
  const name = item.rekam_medis?.pasien?.nama || "Pasien";
  const gradient = getGradient(item.id_reminder);
  const isDone = item.status === "completed";

  const formattedDate = new Date(item.tanggal_kontrol).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div
      className={`bg-white/80 dark:bg-[rgba(25,30,51,0.6)] backdrop-blur-md border border-slate-200 dark:border-white/10 border-l-[5px] ${cfg.border} rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5`}
    >
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Avatar */}
        <div className="w-full h-32 md:w-44 md:h-auto shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}
          >
            <span className="text-4xl font-black text-white/90 select-none">
              {getInitials(name)}
            </span>
          </div>
          {/* Overlay gradient on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 gap-4">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-tight">
                  ID: #{String(item.id_reminder).padStart(4, "0")}
                </span>
                {item.status === "sent" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500">
                    Pengingat Terkirim
                  </span>
                )}
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold">
                {name}
              </h3>
              <p className="text-blue-500 dark:text-blue-400 font-medium text-sm mt-0.5">
                {item.rekam_medis?.diagnosa || (
                  <span className="text-slate-400 italic font-normal">
                    Belum terdiagnosis
                  </span>
                )}
              </p>
            </div>

            {/* Date */}
            <div className="text-left md:text-right shrink-0">
              <div
                className={`flex items-center md:justify-end gap-1.5 font-bold text-base ${cfg.dateColor}`}
              >
                {cfg.icon}
                <span>{formattedDate}</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {isDone
                  ? "Sudah Hadir"
                  : getRelativeDay(item.tanggal_kontrol)}
              </p>
            </div>
          </div>

          {/* Notes */}
          {item.rekam_medis?.catatan && (
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-100">
                    Catatan:{" "}
                  </span>
                  {item.rekam_medis.catatan}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isDone && (
            <div className="flex flex-wrap gap-3 mt-auto pt-1">
              {/* Rekam Medis link */}
              <button
                onClick={() => router.push("/dokter/rekam-medis")}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-blue-500/40 text-blue-500 dark:text-blue-400 hover:bg-blue-500/5 font-semibold text-sm transition-all duration-200"
              >
                <ClipboardList className="w-4 h-4" />
                Rekam Medis
              </button>

              {/* Send reminder (only for pending) */}
              {item.status === "pending" && (
                <button
                  disabled={loading}
                  onClick={() => onSendReminder(item.id_reminder)}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Kirim Pengingat
                </button>
              )}

              {/* Mark done */}
              <button
                disabled={loading}
                onClick={() => onMarkDone(item.id_reminder)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Sudah Hadir
              </button>
            </div>
          )}

          {isDone && (
            <div className="flex items-center gap-2 text-sm text-emerald-500 mt-1">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Kontrol selesai</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white/80 dark:bg-[rgba(25,30,51,0.6)] border border-slate-200 dark:border-white/10 border-l-4 border-l-slate-300 dark:border-l-slate-700 rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full h-32 md:w-44 md:h-auto bg-slate-200 dark:bg-white/5 shrink-0" />
        <div className="flex-1 p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
          </div>
          <div className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl" />
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
            <div className="flex-1 h-10 bg-slate-200 dark:bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DokterKontrolPage() {
  const [data, setData] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  async function fetchData() {
    try {
      const res = await fetch("/api/dokter/kontrol");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function showToast(message: string) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  }

  async function handleMarkDone(id_reminder: number) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/dokter/kontrol", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reminder, status: "completed" }),
      });
      if (res.ok) {
        showToast("Kehadiran pasien berhasil ditandai!");
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendReminder(id_reminder: number) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/dokter/kontrol", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reminder, status: "sent" }),
      });
      if (res.ok) {
        showToast("Pengingat berhasil dikirim ke pasien!");
        fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  // Derived
  const pendingItems = useMemo(
    () => data.filter((d) => d.status !== "completed"),
    [data]
  );
  const completedItems = useMemo(
    () => data.filter((d) => d.status === "completed"),
    [data]
  );
  const displayItems = activeTab === "pending" ? pendingItems : completedItems;

  // Footer stats
  const totalBulanIni = data.length;
  const efisiensi =
    totalBulanIni > 0
      ? Math.round((completedItems.length / totalBulanIni) * 100)
      : 0;

  return (
    <div className="bg-slate-50 dark:bg-[#101322] -m-4 md:-m-6 min-h-screen">
      {toast.show && (
        <SuccessToast
          message={toast.message}
          onClose={() => setToast({ show: false, message: "" })}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Kontrol Lanjutan Pasien
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">
              Kelola jadwal tindak lanjut dan pemantauan kondisi pasien Anda
              secara real-time.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Belum Kontrol
              <span
                className={`ml-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full text-[10px] font-bold ${
                  activeTab === "pending"
                    ? "bg-white/20 text-white"
                    : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {loading ? "…" : pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeTab === "completed"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Sudah Kontrol
              <span
                className={`ml-1 text-xs opacity-70 ${
                  activeTab === "completed" ? "text-white" : ""
                }`}
              >
                {loading ? "…" : completedItems.length}
              </span>
            </button>
          </div>
        </header>

        {/* Card List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                {activeTab === "pending" ? (
                  <CalendarCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <p className="text-slate-500 font-medium">
                {activeTab === "pending"
                  ? "Tidak Ada Pasien Menunggu Kontrol"
                  : "Belum Ada Kontrol Selesai"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {activeTab === "pending"
                  ? "Daftar pasien yang perlu kontrol lanjutan akan muncul di sini."
                  : "Pasien yang telah hadir kontrol akan muncul di sini."}
              </p>
            </div>
          ) : (
            displayItems.map((item) => (
              <PatientCard
                key={item.id_reminder}
                item={item}
                onMarkDone={handleMarkDone}
                onSendReminder={handleSendReminder}
                loading={actionLoading}
              />
            ))
          )}
        </div>

        {/* Footer Stats */}
        {!loading && (
          <footer className="mt-2 flex flex-wrap justify-between items-center px-4 py-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                  Total Pasien
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalBulanIni}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                  Efisiensi Kontrol
                </span>
                <span className="text-2xl font-black text-emerald-500">
                  {efisiensi}%
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <div className="flex flex-col hidden sm:flex">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                  Selesai
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {completedItems.length}
                  <span className="text-slate-400 text-sm font-normal ml-1">
                    /{totalBulanIni}
                  </span>
                </span>
              </div>
            </div>

            <button className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-sm font-medium mt-4 sm:mt-0">
              <Download className="w-4 h-4" />
              Unduh Laporan Bulanan
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
