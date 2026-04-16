"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
    Users,
    UserPlus,
    MoreVertical,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Eye,
    EyeOff,
    Check,
    Shield,
    Activity,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRow {
    id: string;
    email: string;
    role: string;
    status: "active" | "inactive" | "suspended";
    created_at: string;
}

type ActivityLog = {
    id: string;
    type: "create" | "edit" | "delete";
    message: string;
    time: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES = ["pasien", "admin", "perawat", "dokter", "apoteker", "kasir"] as const;
const STATUSES = ["active", "inactive", "suspended"] as const;
const FILTER_TABS = ["Semua", "Admin", "Dokter", "Perawat", "Apoteker", "Pasien", "Kasir"] as const;
const PAGE_SIZE = 5;

const ROLE_COLORS: Record<string, string> = {
    pasien:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    admin:    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    perawat:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dokter:   "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    apoteker: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    kasir:    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const AVATAR_COLORS = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500",
    "bg-pink-500", "bg-cyan-500", "bg-amber-500", "bg-rose-500",
];

const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string }> = {
    active:    { dot: "bg-emerald-500", label: "Aktif",      text: "text-emerald-600 dark:text-emerald-400" },
    inactive:  { dot: "bg-slate-400",   label: "Nonaktif",   text: "text-slate-500 dark:text-slate-400" },
    suspended: { dot: "bg-red-500",     label: "Suspended",  text: "text-red-600 dark:text-red-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(email: string) {
    const prefix = email.split("@")[0];
    const parts = prefix.replace(/[._-]/g, " ").split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

function getAvatarColor(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
    return AVATAR_COLORS[hash];
}

const GLASS = "bg-white dark:bg-[rgba(25,30,51,0.7)] backdrop-blur-md border border-slate-200 dark:border-white/10";

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ user, size = "md" }: { user: UserRow; size?: "sm" | "md" | "lg" }) {
    const sz = size === "lg" ? "w-16 h-16 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
    return (
        <div className={`${sz} rounded-full ${getAvatarColor(user.id)} flex items-center justify-center font-bold text-white shrink-0`}>
            {getInitials(user.email)}
        </div>
    );
}

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
function RowMenu({ user, onEdit, onDelete, currentUserId }: {
    user: UserRow;
    onEdit: (u: UserRow) => void;
    onDelete: (u: UserRow) => void;
    currentUserId: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div className={`absolute right-0 top-10 z-50 w-40 rounded-xl shadow-xl py-1 ${GLASS}`}>
                    <button
                        onClick={() => { onEdit(user); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    {user.id !== currentUserId && (
                        <button
                            onClick={() => { onDelete(user); setOpen(false); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Create Dialog ────────────────────────────────────────────────────────────
function CreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserRow) => void }) {
    const [form, setForm] = useState({ email: "", role: "pasien", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.email || !form.password) { setError("Semua field wajib diisi"); return; }
        if (form.password.length < 6) { setError("Password minimal 6 karakter"); return; }
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/admin/pengguna", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Gagal membuat pengguna"); return; }
            toast.success("Pengguna berhasil ditambahkan!");
            onCreated({
                id: data.id || crypto.randomUUID(),
                email: form.email,
                role: form.role,
                status: "active",
                created_at: new Date().toLocaleDateString("id-ID"),
            });
            onClose();
        } catch {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className={`w-full max-w-md rounded-2xl ${GLASS} p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tambah Pengguna Baru</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Buat akun pengguna sistem baru</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm capitalize"
                        >
                            {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Min. 6 karakter"
                                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            />
                            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Pengguna"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditDialog({ user, onClose, onUpdated }: { user: UserRow; onClose: () => void; onUpdated: (u: UserRow) => void }) {
    const [form, setForm] = useState({ role: user.role, status: user.status });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/admin/pengguna", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, role: form.role, status: form.status }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Gagal memperbarui pengguna"); return; }
            toast.success("Pengguna berhasil diperbarui!");
            onUpdated({ ...user, role: form.role, status: form.status as UserRow["status"] });
            onClose();
        } catch {
            setError("Terjadi kesalahan jaringan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className={`w-full max-w-lg rounded-2xl ${GLASS} shadow-2xl overflow-hidden`} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Informasi Pengguna</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Perbarui data akun pengguna</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 flex gap-6">
                    {/* Left: Avatar section */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <Avatar user={user} size="lg" />
                        <div className="text-center">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ID Pengguna</p>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">{user.id.slice(0, 8)}...</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || ""}`}>
                            <Shield className="w-3 h-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </div>

                    {/* Right: Form */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500 text-sm cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            >
                                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as UserRow["status"] })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            >
                                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PenggunaPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState("");
    const [activeTab, setActiveTab] = useState<string>("Semua");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const undoTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    async function fetchData() {
        try {
            const [usersRes, sessionRes] = await Promise.all([
                fetch("/api/admin/pengguna"),
                fetch("/api/auth/session").catch(() => null),
            ]);
            if (usersRes.ok) setUsers(await usersRes.json());
            if (sessionRes?.ok) {
                const session = await sessionRes.json();
                setCurrentUserId(session?.user?.id ?? "");
            }
        } catch (err) {
            console.error("Failed to fetch pengguna:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // ── Derived data ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = users;
        if (activeTab !== "Semua") {
            list = list.filter((u) => u.role === activeTab.toLowerCase());
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter((u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
        }
        return list;
    }, [users, activeTab, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pagedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function resetPage() { setPage(1); }

    // ── Actions ────────────────────────────────────────────────────────────────
    function addLog(type: ActivityLog["type"], message: string) {
        const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setActivityLog((prev) => [{ id: crypto.randomUUID(), type, message, time: now }, ...prev].slice(0, 10));
    }

    function handleCreated(u: UserRow) {
        setUsers((prev) => [u, ...prev]);
        addLog("create", `Pengguna ${u.email} ditambahkan`);
        resetPage();
    }

    function handleUpdated(u: UserRow) {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
        addLog("edit", `Pengguna ${u.email} diperbarui`);
    }

    function handleDelete(user: UserRow) {
        // Optimistic: remove immediately
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        addLog("delete", `Pengguna ${user.email} dihapus`);

        let undone = false;

        toast.success("Pengguna Berhasil Dihapus!", {
            description: user.email,
            duration: 8000,
            action: {
                label: "Urungkan",
                onClick: () => {
                    undone = true;
                    clearTimeout(undoTimerRef.current[user.id]);
                    setUsers((prev) => {
                        if (prev.find((u) => u.id === user.id)) return prev;
                        return [user, ...prev];
                    });
                    setActivityLog((prev) => prev.filter((l) => l.message !== `Pengguna ${user.email} dihapus`));
                    toast.info("Penghapusan dibatalkan");
                },
            },
        });

        // Actual API call after 8s
        undoTimerRef.current[user.id] = setTimeout(async () => {
            if (undone) return;
            try {
                const res = await fetch(`/api/admin/pengguna?id=${user.id}`, { method: "DELETE" });
                if (!res.ok) {
                    // Revert if API fails
                    const err = await res.json();
                    setUsers((prev) => [user, ...prev]);
                    toast.error(err.error || "Gagal menghapus pengguna");
                }
            } catch {
                setUsers((prev) => [user, ...prev]);
                toast.error("Gagal menghapus pengguna");
            }
        }, 8000);
    }

    useEffect(() => {
        const timers = undoTimerRef.current;
        return () => Object.values(timers).forEach(clearTimeout);
    }, []);

    // ── Tab counts ─────────────────────────────────────────────────────────────
    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = { Semua: users.length };
        FILTER_TABS.forEach((t) => {
            if (t !== "Semua") counts[t] = users.filter((u) => u.role === t.toLowerCase()).length;
        });
        return counts;
    }, [users]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 min-h-full bg-slate-50 dark:bg-[#101322] -m-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Manajemen Pengguna Sistem
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        Kelola akun dan hak akses seluruh pengguna • {users.length} pengguna terdaftar
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0"
                >
                    <UserPlus className="w-4 h-4" /> + Add User
                </button>
            </div>

            {/* Filter Tabs + Search */}
            <div className={`rounded-2xl ${GLASS} p-1.5 flex flex-col gap-3`}>
                {/* Tabs */}
                <div className="flex items-center gap-1 flex-wrap p-1">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); resetPage(); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === tab
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                            }`}
                        >
                            {tab}
                            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold ${
                                activeTab === tab
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                            }`}>
                                {tabCounts[tab] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative px-1 pb-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                        placeholder="Cari berdasarkan email atau role..."
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-2xl ${GLASS} overflow-hidden`}>
                {loading ? (
                    <div className="divide-y divide-slate-200 dark:divide-white/5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                                </div>
                                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : pagedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {search || activeTab !== "Semua" ? "Tidak ada pengguna yang cocok" : "Belum ada pengguna"}
                        </p>
                        {(search || activeTab !== "Semua") && (
                            <button onClick={() => { setSearch(""); setActiveTab("Semua"); resetPage(); }} className="mt-3 text-sm text-primary hover:underline">
                                Reset filter
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_44px] gap-4 px-6 py-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                            {["USER", "ROLE", "STATUS", "BERGABUNG", ""].map((h, i) => (
                                <span key={i} className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{h}</span>
                            ))}
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-slate-200 dark:divide-white/5">
                            {pagedUsers.map((user) => {
                                const sc = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive;
                                return (
                                    <div key={user.id} className="group flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_44px] gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors duration-150">
                                        {/* User */}
                                        <div className="flex items-center gap-3">
                                            <Avatar user={user} />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                    {user.email.split("@")[0]}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[user.role] || ""}`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sc.text}`}>
                                                <span className={`w-2 h-2 rounded-full ${sc.dot} inline-block`} />
                                                {sc.label}
                                            </span>
                                        </div>

                                        {/* Joined */}
                                        <div className="flex items-center">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{user.created_at}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end md:justify-center">
                                            <RowMenu
                                                user={user}
                                                onEdit={setEditUser}
                                                onDelete={handleDelete}
                                                currentUserId={currentUserId}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {filtered.length > PAGE_SIZE && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Menampilkan {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} pengguna
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                                page === i + 1
                                                    ? "bg-primary text-white"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Activity Log */}
            {activityLog.length > 0 && (
                <div className={`rounded-2xl ${GLASS} p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Riwayat Aktivitas Terakhir</h2>
                    </div>
                    <div className="relative pl-6">
                        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200 dark:bg-slate-700/50" />
                        <div className="space-y-4">
                            {activityLog.map((log) => {
                                const cfg = {
                                    create: { icon: UserPlus, color: "bg-emerald-500 text-white", ring: "ring-emerald-200 dark:ring-emerald-500/20" },
                                    edit:   { icon: Pencil,   color: "bg-primary text-white",    ring: "ring-primary/20" },
                                    delete: { icon: Trash2,   color: "bg-red-500 text-white",     ring: "ring-red-200 dark:ring-red-500/20" },
                                }[log.type];
                                const Icon = cfg.icon;
                                return (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <div className={`w-4 h-4 rounded-full ${cfg.color} ring-2 ${cfg.ring} flex items-center justify-center shrink-0 -ml-[22px]`}>
                                            <Icon className="w-2.5 h-2.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{log.message}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{log.time}</p>
                                        </div>
                                        {log.type === "delete" && (
                                            <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showCreate && <CreateDialog onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
            {editUser && <EditDialog user={editUser} onClose={() => setEditUser(null)} onUpdated={handleUpdated} />}
        </div>
    );
}
