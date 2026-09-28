import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, X, ShieldCheck } from 'lucide-react';
import { uploadSingleFile } from '../lib/uploadService';

interface BoardMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  note?: string;
  sortOrder?: number;
}

/**
 * Quản trị "Ban quản trị Chợ cư dân" (hiển thị ở trang Về chúng tôi trên web).
 * Admin: thêm / sửa / xóa thành viên + upload avatar.
 */
export const AdminBoardMembersManager: React.FC = () => {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<BoardMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', avatar: '', phone: '', note: '', sortOrder: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/board-members');
      const data = res.ok ? await res.json() : [];
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setIsCreating(true);
    setForm({ name: '', role: 'Thành viên', avatar: '', phone: '', note: '', sortOrder: members.length + 1 });
  };

  const openEdit = (m: BoardMember) => {
    setIsCreating(false);
    setEditing(m);
    setForm({
      name: m.name || '',
      role: m.role || '',
      avatar: m.avatar || '',
      phone: m.phone || '',
      note: m.note || '',
      sortOrder: m.sortOrder || 0
    });
  };

  const closeForm = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const url = await uploadSingleFile(file);
      if (url) setForm((prev) => ({ ...prev, avatar: url }));
    } catch {
      alert('Tải ảnh thất bại, vui lòng thử lại.');
    }
    setBusy(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên thành viên.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        isCreating ? '/api/admin/board-members' : `/api/admin/board-members/${editing?.id}`,
        {
          method: isCreating ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      closeForm();
      await load();
    } catch {
      alert('Lưu thất bại, vui lòng thử lại.');
    }
    setBusy(false);
  };

  const handleDelete = async (m: BoardMember) => {
    if (!confirm(`Xóa "${m.name}" khỏi Ban quản trị?`)) return;
    try {
      const res = await fetch(`/api/admin/board-members/${m.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await load();
    } catch {
      alert('Xóa thất bại, vui lòng thử lại.');
    }
  };

  const formOpen = isCreating || !!editing;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-100">Ban quản trị Chợ cư dân</div>
            <div className="text-[10.5px] text-slate-500">Hiển thị ở trang "Về chúng tôi" trên web (có avatar)</div>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm thành viên
        </button>
      </div>

      {/* List */}
      <div className="p-3 space-y-2">
        {loading ? (
          <div className="text-xs text-slate-400 py-3 text-center">Đang tải…</div>
        ) : members.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center">
            Chưa có thành viên nào. Bấm "Thêm thành viên" để tạo.
          </div>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                {m.avatar ? (
                  <img loading="lazy" src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base font-black text-slate-500">
                    {(m.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 truncate">{m.name}</div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">{m.role}</div>
                {m.phone && <div className="text-[10.5px] text-slate-500">{m.phone}</div>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Sửa"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={closeForm} />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                {isCreating ? 'Thêm thành viên ban quản trị' : 'Sửa thành viên ban quản trị'}
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                {form.avatar ? (
                  <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-slate-400">
                    {(form.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Tải avatar lên
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleUpload(e.target.files?.[0] || null)}
                  />
                </label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                  placeholder="hoặc dán URL ảnh…"
                  className="w-full text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Tên thành viên *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Chức vụ</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="VD: Trưởng ban"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">SĐT / Zalo</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  placeholder="09xx…"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Ghi chú / Nhiệm vụ</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'Đang lưu…' : isCreating ? 'Tạo thành viên' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminBoardMembersManager;
