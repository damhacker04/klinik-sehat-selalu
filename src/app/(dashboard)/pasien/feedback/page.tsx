"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/validations/patient";
import { toast } from "sonner";
import {
  Star,
  Send,
  ShieldCheck,
  Heart,
  History,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feedback {
  id_feedback: number;
  id_pasien: number;
  rating: number;
  komentar: string | null;
  tanggal_feedback: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS =
  "bg-white/70 dark:bg-[rgba(25,30,51,0.6)] backdrop-blur-md border border-slate-200/80 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Star Row (display-only) ──────────────────────────────────────────────────

function StarRow({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const cls = size === "lg" ? "w-12 h-12" : "w-4 h-4";
  return (
    <div className={`flex gap-${size === "lg" ? "2" : "0.5"}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            cls,
            "transition-colors",
            rating >= s
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          )}
        />
      ))}
    </div>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────

function HistoryCard({ fb }: { fb: Feedback }) {
  return (
    <div
      className={`${GLASS} rounded-xl p-5 hover:border-primary/50 transition-colors duration-200`}
    >
      <div className="flex justify-between items-start mb-3">
        <StarRow rating={fb.rating} size="sm" />
        <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
          {fmtDate(fb.tanggal_feedback)}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2">
        {fb.komentar
          ? `"${fb.komentar}"`
          : <span className="not-italic text-slate-400 dark:text-slate-600">Tidak ada komentar</span>}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [showAll, setShowAll] = useState(false);

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, komentar: "" },
  });

  const ratingValue = form.watch("rating");
  const displayList = showAll ? feedbackList : feedbackList.slice(0, 3);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pasien/feedback");
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      }
    })();
  }, []);

  async function onSubmit(data: FeedbackInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/pasien/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal mengirim penilaian");
        return;
      }

      const result = await res.json();
      toast.success("Penilaian berhasil dikirim!", {
        description: "Terima kasih atas masukan Anda.",
      });
      form.reset();
      if (result.data) {
        setFeedbackList((prev) => [result.data as Feedback, ...prev]);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-10 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">
          Sampaikan Penilaian Anda
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Bantu kami jadi lebih baik untuk melayani Anda!
        </p>
      </div>

      {/* ── Main 3-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form card (col-span-2) */}
        <div className={`lg:col-span-2 ${GLASS} rounded-xl p-8 flex flex-col gap-8 shadow-xl`}>
          {/* Star picker */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Beri Bintang untuk Layanan Hari Ini
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => form.setValue("rating", star, { shouldValidate: true })}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Beri ${star} bintang`}
                >
                  <Star
                    className={cn(
                      "w-12 h-12 transition-colors duration-150",
                      (hoveredStar || ratingValue) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    )}
                  />
                </button>
              ))}
            </div>
            {form.formState.errors.rating && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="komentar"
              className="text-base font-semibold text-slate-700 dark:text-slate-300"
            >
              Catatan atau Ulasan
            </label>
            <textarea
              id="komentar"
              {...form.register("komentar")}
              placeholder="Ceritakan pengalaman Anda di klinik kami..."
              rows={6}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-900/50 border-0 p-5 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary min-h-[180px] text-lg resize-none outline-none transition-shadow"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading}
              className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <span>Kirim Penilaian</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info card (col-span-1) */}
        <div
          className={`lg:col-span-1 ${GLASS} rounded-xl p-6 relative overflow-hidden min-h-[240px] flex flex-col justify-between shadow-xl`}
        >
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Terima Kasih!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Setiap ulasan sangat berarti bagi tenaga medis kami untuk terus
                berkembang.
              </p>
            </div>

            <div className="bg-primary/20 p-4 rounded-xl border border-primary/30">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Anonim &amp; Aman
                </span>
              </div>
            </div>
          </div>

          {/* Decorative watermark */}
          <Heart
            className="absolute -right-10 -bottom-10 w-40 h-40 text-slate-900 dark:text-white opacity-10"
            aria-hidden
          />
        </div>
      </div>

      {/* ── Riwayat Ulasan ── */}
      <div className="flex flex-col gap-6 pt-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <History className="w-6 h-6 text-primary" />
            Riwayat Ulasan
          </h2>
          {feedbackList.length > 3 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-primary text-sm font-semibold hover:underline transition-colors"
            >
              {showAll ? "Sembunyikan" : "Lihat Semua"}
            </button>
          )}
        </div>

        {/* Cards grid */}
        {feedbackList.length === 0 ? (
          <div
            className={`${GLASS} rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center`}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                Belum Ada Ulasan
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Penilaian yang sudah Anda kirim akan muncul di sini.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList.map((fb) => (
              <HistoryCard key={fb.id_feedback} fb={fb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
