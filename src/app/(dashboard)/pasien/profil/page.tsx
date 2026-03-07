"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pasienSchema, type PasienInput } from "@/lib/validations/patient";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { User, Save, Loader2, Edit2, X } from "lucide-react";

export default function ProfilPasienPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<PasienInput>({
        resolver: zodResolver(pasienSchema),
        defaultValues: {
            nama: "",
            nik: "",
            tanggal_lahir: "",
            alamat: "",
            no_hp: "",
            email: "",
            riwayat_kesehatan: "",
        },
    });

    useEffect(() => {
        async function fetchProfil() {
            try {
                const res = await fetch("/api/pasien/profil");
                if (res.ok) {
                    const data = await res.json();
                    form.reset({
                        nama: data.nama || "",
                        nik: data.nik === "-" ? "" : data.nik || "",
                        tanggal_lahir: data.tanggal_lahir || "",
                        alamat: data.alamat || "",
                        no_hp: data.no_hp || "",
                        email: data.email || "",
                        riwayat_kesehatan: data.riwayat_kesehatan || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                toast.error("Gagal memuat data profil");
            } finally {
                setLoading(false);
            }
        }
        fetchProfil();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSubmit(data: PasienInput) {
        setSaving(true);
        try {
            const res = await fetch("/api/pasien/profil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Gagal menyimpan profil");
                return;
            }

            toast.success("Profil berhasil diperbarui!");
            setIsEditing(false);
        } catch {
            toast.error("Terjadi kesalahan jaringan");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        // Reset form to its current actual values without saving
        setIsEditing(false);
        form.reset();
        // Since reset goes back to defaultValues, let's keep it simple or re-fetch
        // But the current implementation modifies the form values directly, so resetting 
        // to defaultValues might clear out unsaved changes back to saved ones if defaultValues
        // were set properly initially. However, fetchProfil sets form.reset(data).
        // Since we want to re-load from defaultValues, we can just call fetchProfil again
        // to ensure Data is pulled correctly from what's currently saved.
        setLoading(true);
        fetch("/api/pasien/profil")
            .then((res) => res.json())
            .then((data) => {
                form.reset({
                    nama: data.nama || "",
                    nik: data.nik === "-" ? "" : data.nik || "",
                    tanggal_lahir: data.tanggal_lahir || "",
                    alamat: data.alamat || "",
                    no_hp: data.no_hp || "",
                    email: data.email || "",
                    riwayat_kesehatan: data.riwayat_kesehatan || "",
                });
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Profil Saya"
                description="Kelola informasi pribadi Anda"
            />

            <Card className="max-w-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-500" />
                        Informasi Pribadi
                    </CardTitle>
                    {!loading && !isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="h-8 gap-1 hidden sm:flex"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Profil</span>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap *</FormLabel>
                                                <FormControl>
                                                    <Input disabled={!isEditing} placeholder="Nama lengkap" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nik"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NIK *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={!isEditing}
                                                        placeholder="16 digit NIK"
                                                        maxLength={16}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="tanggal_lahir"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal Lahir</FormLabel>
                                                <FormControl>
                                                    <Input disabled={!isEditing} type="date" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="no_hp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. HP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={!isEditing}
                                                        placeholder="08xxxxxxxxxx"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={!isEditing}
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="alamat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alamat</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    disabled={!isEditing}
                                                    placeholder="Alamat lengkap"
                                                    className="min-h-[80px] resize-none"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="riwayat_kesehatan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Riwayat Kesehatan</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    disabled={!isEditing}
                                                    placeholder="Alergi, penyakit bawaan, riwayat operasi, dll."
                                                    className="min-h-[100px] resize-none"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {isEditing ? (
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="w-full sm:w-auto"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Simpan Profil
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="sm:hidden mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            className="w-full"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Profil
                                        </Button>
                                    </div>
                                )}

                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
