"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  History,
  ChevronDown,
  Zap,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface JadwalRow {
  id: number;
  nama: string;
  role: "dokter" | "perawat";
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
}

interface StaffItem {
  id: number;
  nama: string;
  role: string;
}

const HARI_OPTS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const PAGE_SIZE = 10;

const GLASS =
  "bg-white/80 dark:bg-[rgba(19,55,236,0.03)] backdrop-blur-md border border-slate-200 dark:border-white/5";
const INPUT_CLS =
  "w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white";

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase();
}

function getShift(jamMulai: string): string {
  const h = parseInt(jamMulai?.split(":")[0] || "0");
  if (h < 12) return "Pagi";
  if (h < 18) return "Siang";
  return "Malam";
}

function getPaginationItems(page: number, totalPages: number): (number | string)[] {
  const items: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
  } else {
    items.push(1);
    if (page > 3) items.push("dots-before");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
    if (page < totalPages - 2) items.push("dots-after");
    items.push(totalPages);
  }
  return items;
}

export default function JadwalPage() {
  const [data, setData] = useState<JadwalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Staff list
  const [staffList, setStaffList] = useState<StaffItem[]>([]);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addStaffType, setAddStaffType] = useState<"dokter" | "perawat">("dokter");
  const [addStaffId, setAddStaffId] = useState("");
  const [addHari, setAddHari] = useState<string[]>([]);
  const [addJamMulai, setAddJamMulai] = useState("");
  const [addJamSelesai, setAddJamSelesai] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Individual edit dialog
  const [editItem, setEditItem] = useState<JadwalRow | null>(null);
  const [editHari, setEditHari] = useState<string[]>([]);
  const [editJamMulai, setEditJamMulai] = useState("");
  const [editJamSelesai, setEditJamSelesai] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Bulk edit dialog
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkHari, setBulkHari] = useState<string[]>([]);
  const [bulkJamMulai, setBulkJamMulai] = useState("");
  const [bulkJamSelesai, setBulkJamSelesai] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Undo
  const [undoSnapshot, setUndoSnapshot] = useState<JadwalRow[] | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoSubmitting, setUndoSubmitting] = useState(false);

  // Success toast
  const [successToast, setSuccessToast] = useState<"bulk-edit" | "bulk-delete" | "undo" | null>(null);

  // Delete in progress
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (!successToast) return;
    const t = setTimeout(
      () => setSuccessToast(null),
      successToast === "bulk-edit" ? 8000 : 4000
    );
    return () => clearTimeout(t);
  }, [successToast]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jadwal");
      if (res.ok) setData(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pengguna");
      if (res.ok) {
        const users: StaffItem[] = await res.json();
        setStaffList(users.filter((u) => u.role === "dokter" || u.role === "perawat"));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, [fetchData, fetchStaff]);

  // Filtering + pagination
  const filtered = data.filter((r) => {
    const matchSearch = r.nama.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || r.role === filterRole;
    const matchShift = filterShift === "all" || getShift(r.jam_mulai) === filterShift;
    return matchSearch && matchRole && matchShift;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allPageSelected = pageData.length > 0 && pageData.every((r) => selectedIds.has(r.id));
  const selectedCount = selectedIds.size;

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        pageData.forEach((r) => n.delete(r.id));
        return n;
      });
    } else {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        pageData.forEach((r) => n.add(r.id));
        return n;
      });
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function changePage(n: number) {
    setPage(Math.max(1, Math.min(n, totalPages)));
  }

  // Handlers
  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/jadwal?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Jadwal berhasil dihapus");
        setSelectedIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          fetch(`/api/admin/jadwal?id=${id}`, { method: "DELETE" })
        )
      );
      setSuccessToast("bulk-delete");
      clearSelection();
      fetchData();
    } catch {
      toast.error("Gagal menghapus jadwal terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleAddSubmit() {
    if (!addStaffId || addHari.length === 0 || !addJamMulai || !addJamSelesai) {
      toast.error("Semua field wajib diisi");
      return;
    }
    setAddSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        hari: addHari.join(", "),
        jam_mulai: addJamMulai,
        jam_selesai: addJamSelesai,
      };
      if (addStaffType === "dokter") body.id_dokter = parseInt(addStaffId);
      else body.id_perawat = parseInt(addStaffId);

      const res = await fetch("/api/admin/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Jadwal berhasil ditambahkan");
        setAddOpen(false);
        setAddStaffId("");
        setAddHari([]);
        setAddJamMulai("");
        setAddJamSelesai("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambahkan jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setAddSubmitting(false);
    }
  }

  function openEdit(item: JadwalRow) {
    setEditItem(item);
    setEditHari([]);
    setEditJamMulai(item.jam_mulai);
    setEditJamSelesai(item.jam_selesai);
  }

  async function handleEditSubmit() {
    if (!editItem) return;
    if (!editJamMulai || !editJamSelesai) {
      toast.error("Jam mulai dan jam selesai wajib diisi");
      return;
    }
    setEditSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        id: editItem.id,
        jam_mulai: editJamMulai,
        jam_selesai: editJamSelesai,
      };
      if (editHari.length > 0) body.hari = editHari.join(", ");

      const res = await fetch("/api/admin/jadwal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Jadwal berhasil diperbarui");
        setEditItem(null);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal memperbarui jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleBulkEditSubmit() {
    if (bulkHari.length === 0 && !bulkJamMulai && !bulkJamSelesai) {
      toast.error("Isi minimal satu field untuk diperbarui");
      return;
    }
    const snapshot = data.filter((r) => selectedIds.has(r.id));
    setUndoSnapshot(snapshot);
    setBulkSubmitting(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => {
          const body: Record<string, unknown> = { id };
          if (bulkHari.length > 0) body.hari = bulkHari.join(", ");
          if (bulkJamMulai) body.jam_mulai = bulkJamMulai;
          if (bulkJamSelesai) body.jam_selesai = bulkJamSelesai;
          return fetch("/api/admin/jadwal", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        })
      );
      setBulkEditOpen(false);
      clearSelection();
      setBulkHari([]);
      setBulkJamMulai("");
      setBulkJamSelesai("");
      setSuccessToast("bulk-edit");
      fetchData();
    } catch {
      toast.error("Gagal memperbarui jadwal");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function handleUndo() {
    const snapshot = undoSnapshot;
    if (!snapshot) return;
    setUndoSubmitting(true);
    try {
      await Promise.all(
        snapshot.map((r) =>
          fetch("/api/admin/jadwal", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: r.id,
              hari: r.hari,
              jam_mulai: r.jam_mulai,
              jam_selesai: r.jam_selesai,
            }),
          })
        )
      );
      setUndoOpen(false);
      setSuccessToast("undo");
      setUndoSnapshot(null);
      fetchData();
    } catch {
      toast.error("Gagal membatalkan perubahan");
    } finally {
      setUndoSubmitting(false);
    }
  }

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="h-9 w-56 bg-muted rounded-xl" />
            <div className="h-4 w-80 bg-muted rounded-lg" />
          </div>
          <div className="h-11 w-48 bg-muted rounded-xl" />
        </div>
        <div className="h-16 bg-muted rounded-2xl" />
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    );
  }

  const filteredStaff = staffList.filter((s) => s.role === addStaffType);

  // ── Render ──
  return (
    <div className={`space-y-6 relative ${selectedCount > 0 ? "pb-28" : ""}`}>
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Jadwal Praktik
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Kelola jadwal operasional tenaga medis dan poli klinik.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Tambah Jadwal Terpadu
        </button>
      </header>

      {/* ── Filter Toolbar ── */}
      <div className={`${GLASS} rounded-2xl p-4 flex flex-wrap items-center gap-3`}>
        {/* Search — left-most */}
        <div className="relative flex items-center w-full sm:w-auto">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama tenaga medis..."
            className="pl-9 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full sm:w-[260px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Peran filter */}
        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-4 pr-8 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="all">Peran: Semua</option>
            <option value="dokter">Dokter</option>
            <option value="perawat">Perawat</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Shift filter */}
        <div className="relative">
          <select
            value={filterShift}
            onChange={(e) => {
              setFilterShift(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-4 pr-8 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="all">Shift: Semua</option>
            <option value="Pagi">Pagi (07–11)</option>
            <option value="Siang">Siang (12–17)</option>
            <option value="Malam">Malam (18+)</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#161b33] rounded-2xl shadow-xl shadow-black/5 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary/20 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Nama Tenaga Medis
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Peran
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Hari Praktik
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Jam Praktik
                </th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      {search || filterRole !== "all" || filterShift !== "all"
                        ? "Tidak ada jadwal yang cocok"
                        : "Belum ada jadwal"}
                    </p>
                  </td>
                </tr>
              ) : (
                pageData.map((row) => {
                  const isSelected = selectedIds.has(row.id);
                  const isDeleting = deletingId === row.id;
                  const isDokter = row.role === "dokter";
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                        isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(row.id)}
                          className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-primary/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                              isDokter
                                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
                                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                            }`}
                          >
                            {getInitials(row.nama)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                              {row.nama}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">{row.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDokter
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                              : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {isDokter ? "Dokter" : "Perawat"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {row.hari}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {row.jam_mulai} - {row.jam_selesai}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(row)}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors"
                            title="Edit jadwal"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Hapus jadwal"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {filtered.length === 0
              ? "Tidak ada jadwal"
              : `Menampilkan ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} dari ${filtered.length} jadwal`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {getPaginationItems(page, totalPages).map((item) =>
              typeof item === "string" ? (
                <span key={item} className="px-2 text-slate-400 text-sm select-none">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => changePage(item)}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === item
                      ? "bg-primary text-white shadow-sm"
                      : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-widest font-semibold pb-2">
        <span>© 2024 CMS Klinik Terpadu</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          <span>Sistem Sinkronisasi Aktif</span>
        </div>
      </footer>

      {/* ── Floating Bulk Action Bar (Portal — bypasses layout stacking context) ── */}
      {selectedCount > 0 && typeof window !== "undefined" && createPortal(
        <div className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="bg-slate-900 dark:bg-slate-800 px-4 sm:px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/30 flex items-center gap-3 sm:gap-4 border border-white/10 pointer-events-auto max-w-lg w-full sm:w-auto sm:min-w-[480px]">
            <div className="flex items-center gap-2.5 pr-3 sm:pr-4 border-r border-white/20 shrink-0">
              <div className="bg-primary text-white text-xs font-bold h-7 w-7 rounded-full flex items-center justify-center">
                {selectedCount}
              </div>
              <span className="text-sm font-semibold text-white whitespace-nowrap hidden sm:inline">
                Jadwal Terpilih
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setBulkEditOpen(true)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Masal</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Hapus Terpilih</span>
                <span className="sm:hidden">Hapus</span>
              </button>
              <button
                onClick={clearSelection}
                className="p-2 text-slate-400 hover:text-white transition-colors ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Success Toast ── */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-900/90 border border-emerald-500/20 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-md min-w-[280px]">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Berhasil!</p>
              <p className="text-xs text-slate-400">
                {successToast === "bulk-edit"
                  ? "Jadwal berhasil diperbarui secara masal"
                  : successToast === "bulk-delete"
                  ? "Jadwal terpilih berhasil dihapus"
                  : "Perubahan berhasil dibatalkan"}
              </p>
              {successToast === "bulk-edit" && (
                <button
                  onClick={() => setUndoOpen(true)}
                  className="mt-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400 underline underline-offset-2 transition-colors"
                >
                  Urungkan
                </button>
              )}
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Add Dialog ── */}
      {addOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setAddOpen(false)}
        >
          <div className="bg-white dark:bg-[#101322] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Tambah Jadwal Terpadu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Isi informasi lengkap jadwal tenaga medis
                </p>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tipe Staf
                  </label>
                  <select
                    value={addStaffType}
                    onChange={(e) => {
                      setAddStaffType(e.target.value as "dokter" | "perawat");
                      setAddStaffId("");
                    }}
                    className={INPUT_CLS}
                  >
                    <option value="dokter">Dokter</option>
                    <option value="perawat">Perawat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nama Staf
                  </label>
                  <select
                    value={addStaffId}
                    onChange={(e) => setAddStaffId(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">Pilih staf...</option>
                    {filteredStaff.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hari Praktik
                </label>
                <div className="flex flex-wrap gap-2">
                  {HARI_OPTS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        setAddHari((prev) =>
                          prev.includes(h) ? prev.filter((d) => d !== h) : [...prev, h]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        addHari.includes(h)
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                          : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={addJamMulai}
                    onChange={(e) => setAddJamMulai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={addJamSelesai}
                    onChange={(e) => setAddJamSelesai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setAddOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={addSubmitting}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/40 disabled:opacity-60 flex items-center gap-2"
              >
                {addSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Individual Edit Dialog ── */}
      {editItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setEditItem(null)}
        >
          <div className="bg-white dark:bg-[#101322] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Jadwal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editItem.nama}
                </p>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hari Praktik{" "}
                  <span className="normal-case font-normal text-slate-500">
                    (opsional — kosongkan untuk tidak mengubah)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HARI_OPTS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        setEditHari((prev) =>
                          prev.includes(h) ? prev.filter((d) => d !== h) : [...prev, h]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        editHari.includes(h)
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                          : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={editJamMulai}
                    onChange={(e) => setEditJamMulai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={editJamSelesai}
                    onChange={(e) => setEditJamSelesai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditItem(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editSubmitting}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/40 disabled:opacity-60 flex items-center gap-2"
              >
                {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Edit Dialog ── */}
      {bulkEditOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setBulkEditOpen(false)}
        >
          <div className="bg-white dark:bg-[#101322] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Jadwal Masal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mengedit {selectedCount} jadwal terpilih
                </p>
              </div>
              <button
                onClick={() => setBulkEditOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hari Praktik{" "}
                  <span className="normal-case font-normal text-slate-500">
                    (kosongkan untuk tidak mengubah)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HARI_OPTS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        setBulkHari((prev) =>
                          prev.includes(h) ? prev.filter((d) => d !== h) : [...prev, h]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        bulkHari.includes(h)
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                          : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={bulkJamMulai}
                    onChange={(e) => setBulkJamMulai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={bulkJamSelesai}
                    onChange={(e) => setBulkJamSelesai(e.target.value)}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setBulkEditOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleBulkEditSubmit}
                disabled={bulkSubmitting}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/40 disabled:opacity-60 flex items-center gap-2"
              >
                {bulkSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Undo Confirmation Dialog ── */}
      {undoOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setUndoOpen(false)}
        >
          <div className="bg-white dark:bg-[#101322] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Konfirmasi Pembatalan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin membatalkan perubahan masal yang baru saja dilakukan?
                Tindakan ini akan mengembalikan data ke kondisi sebelumnya.
              </p>
            </div>
            <div className="px-6 py-5 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setUndoOpen(false)}
                className="w-full sm:flex-1 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUndo}
                disabled={undoSubmitting}
                className="w-full sm:flex-1 px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {undoSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Urungkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
