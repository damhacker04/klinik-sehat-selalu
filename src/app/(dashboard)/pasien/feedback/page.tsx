"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/validations/patient";
import { useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      komentar: "",
    },
  });

  const ratingValue = form.watch("rating");

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch("/api/pasien/feedback");
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      }
    }
    fetchFeedback();
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
        toast.error(err.error || "Gagal mengirim feedback");
        return;
      }

      const result = await res.json();
      toast.success("Terima kasih atas feedback Anda!");
      form.reset();
      // Add to local list
      if (result.data) {
        setFeedbackList((prev) => [result.data, ...prev]);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Feedback"
        description="Berikan penilaian dan saran untuk layanan kami"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Beri Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating *</FormLabel>
                      <FormControl>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 transition-transform hover:scale-110"
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              onClick={() => field.onChange(star)}
                            >
                              <Star
                                className={cn(
                                  "h-8 w-8 transition-colors",
                                  (hoveredStar || ratingValue) >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="komentar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Komentar (opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ceritakan pengalaman Anda di klinik kami..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Riwayat Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackList.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Belum Ada Feedback"
                description="Feedback yang sudah Anda kirim akan muncul di sini."
              />
            ) : (
              <div className="space-y-3">
                {feedbackList.map((fb: any) => (
                  <div key={fb.id_feedback} className="rounded-lg border p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            fb.rating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    {fb.komentar && (
                      <p className="text-sm text-muted-foreground">{fb.komentar}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(fb.tanggal_feedback).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
