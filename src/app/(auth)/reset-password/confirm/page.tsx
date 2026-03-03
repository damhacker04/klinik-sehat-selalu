"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/shared/password-input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password minimal 8 karakter")
            .regex(
                /^(?=.*[A-Z])(?=.*\d)/,
                "Password harus mengandung huruf besar dan angka"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Konfirmasi password tidak cocok",
        path: ["confirmPassword"],
    });

type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordConfirmForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Check for error in URL (e.g., expired link)
    const urlError = searchParams.get("error_description");

    const form = useForm<ResetPasswordFormInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    async function onSubmit(data: ResetPasswordFormInput) {
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({
                password: data.newPassword,
            });

            if (updateError) {
                if (updateError.message.includes("same_password")) {
                    setError("Password baru tidak boleh sama dengan password lama.");
                } else {
                    setError(updateError.message);
                }
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch {
            setError("Terjadi kesalahan jaringan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    if (urlError) {
        return (
            <Card className="border-0 shadow-xl shadow-black/5">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <KeyRound className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Link Tidak Valid
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {urlError === "access_denied"
                            ? "Link reset password sudah kedaluwarsa atau tidak valid. Silakan request ulang."
                            : urlError}
                    </p>
                </CardHeader>
                <CardFooter className="pt-4 pb-6">
                    <Link href="/reset-password" className="w-full">
                        <Button variant="outline" className="w-full h-11">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Request Ulang
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    if (success) {
        return (
            <Card className="border-0 shadow-xl shadow-black/5">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Password Berhasil Diubah!
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Password Anda telah berhasil diperbarui. Silakan login dengan
                        password baru Anda.
                    </p>
                </CardHeader>
                <CardFooter className="pt-4 pb-6">
                    <Link href="/login" className="w-full">
                        <Button className="w-full h-11">Masuk ke Akun</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
                    <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Buat Password Baru
                </h1>
                <p className="text-sm text-muted-foreground">
                    Masukkan password baru untuk akun Anda
                </p>
            </CardHeader>
            <CardContent className="pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password Baru</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="Min 8 karakter, huruf besar & angka"
                                            className="h-11"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="Ulangi password baru"
                                            className="h-11"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Memproses..." : "Ubah Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center pb-6">
                <Link
                    href="/login"
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali ke Login
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function ResetPasswordConfirmPage() {
    return (
        <Suspense>
            <ResetPasswordConfirmForm />
        </Suspense>
    );
}
