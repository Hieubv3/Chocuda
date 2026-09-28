import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, XCircle, Search, RefreshCw, ShieldCheck, Clock, Users, Phone, Mail, MapPin, FileText, Trash2, Plus, Edit3 } from 'lucide-react';
import { BusinessTier } from '../types';

/**
 * Quản lý doanh nghiệp (admin) — G2 của đề xuất tài khoản doanh nghiệp.
 * Đọc: docs/de-xuat-tai-khoan-doanh-nghiep.md
 * Dùng API: GET /api/admin/businesses, POST /api/admin/businesses/:id/approve|reject
 */

const TIERS: { code: BusinessTier; name: string }[] = [
  { code: 'starter', name: 'DN Khởi tạo' },
  { code: 'verified', name: 'DN Xác thực' },
  { code: 'pro', name: 'DN Pro' },
  { code: 'enterprise', name: 'DN Enterprise' },
];

const TYPE_LABEL: Record<string, string> = {
  real_estate: 'Bất động sản',
  resident_service: 'Dịch vụ cư dân',
  fnb: 'F&B / Bán lẻ',
  other: 'Ngành khác',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  pending: 'Chờ duyệt',
  verified: 'Đã xác thực',
  rejected: 'Từ chối',
  suspended: 'Tạm dừng',
};

const STATUS_CLS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  suspended: 'bg-slate-200 text-slate-700',
};

interface BusinessAccountRow {
  id: string;
  ownerUserId: string;
  name: string;
  brandName?: string;
  type: string;
  taxCode?: string;
  businessLicenseNo?: string;
  licenseFileUrl?: string;
  address?: string;
  project?: string;
  legalRepName?: string;
  legalRepPhone?: string;
  contactEmail?: string;
  industryNote?: string;
  status: string;
  tierCode?: BusinessTier;
  verifiedAt?: string;
  adminNote?: string;
  createdAt: string;
}

export const AdminBusinessManager: React.FC = () => {
  const [list, setList] = useState<BusinessAccountRow[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tierDraft, setTierDraft] = useState<Record<string, BusinessTier>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch('/api/admin/businesses?' + params.toString());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setList(Array.isArray(data.list) ? data.list : []);
      if (data.stats) setStats(data.stats);
      setMessage('');
    } catch (err: any) {
      setMessage('Không tải được danh sách doanh nghiệp: ' + (err?.message || 'lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter, typeFilter]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusy(id + action);
    try {
      const body: any = {};
      if (action === 'approve') body.tierCode = tierDraft[id] || 'verified';
      if (noteDraft[id]) body.adminNote = noteDraft[id];
      const res = await fetch(`/api/admin/businesses/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setMessage(action === 'approve' ? 'Đã duyệt doanh nghiệp.' : 'Đã từ chối hồ sơ.');
      await load();
    } catch (err: any) {
      setMessage('Thao tác thất bại: ' + (err?.message || 'lỗi không xác định'));
    } finally {
      setBusy(null);
    }
  };

  // Xóa doanh nghiệp (chuyển vào Thùng rác - khôi phục được)
  const handleDeleteBusiness = async (id: string, label: string) => {
    if (!confirm(`Xóa doanh nghiệp "${label}"? (Có thể khôi phục từ Thùng rác)`)) return;
    setBusy(id + 'delete');
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setMessage('Đã chuyển doanh nghiệp vào Thùng rác.');
      await load();
    } catch (err: any) {
      setMessage('Xóa thất bại: ' + (err?.message || 'lỗi không xác định'));
    } finally {
      setBusy(null);
    }
  };

  const pendingList = useMemo(() => list.filter(b => b.status === 'pending'), [list]);

  // Form thêm/sửa doanh nghiệp (admin)
  const [bizFormOpen, setBizFormOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<BusinessAccountRow | null>(null);
  const [bizDraft, setBizDraft] = useState<any>({});

  const openCreateBiz = () => {
    setEditingBiz(null);
    setBizDraft({ name: '', brandName: '', type: 'resident_service', taxCode: '', businessLicenseNo: '', address: '', project: '', legalRepName: '', legalRepPhone: '', contactEmail: '', status: 'verified', tierCode: 'starter', adminNote: '' });
    setBizFormOpen(true);
  };

  const openEditBiz = (b: BusinessAccountRow) => {
    setEditingBiz(b);
    setBizDraft({ name: b.name || '', brandName: b.brandName || '', type: b.type || 'resident_service', taxCode: b.taxCode || '', businessLicenseNo: b.businessLicenseNo || '', address: b.address || '', project: b.project || '', legalRepName: b.legalRepName || '', legalRepPhone: b.legalRepPhone || '', contactEmail: b.contactEmail || '', status: b.status || 'draft', tierCode: b.tierCode || 'starter', adminNote: b.adminNote || '' });
    setBizFormOpen(true);
  };

  const handleSaveBiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(bizDraft.name || '').trim()) {
      setMessage('Vui lòng nhập tên doanh nghiệp.');
      return;
    }
    setBusy('biz-save');
    try {
      const res = await fetch(editingBiz ? `/api/admin/businesses/${editingBiz.id}` : '/api/admin/businesses', {
        method: editingBiz ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bizDraft)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
      setBizFormOpen(false);
      setMessage(editingBiz ? 'Đã cập nhật doanh nghiệp.' : 'Đã thêm doanh nghiệp mới.');
      await load();
    } catch (err: any) {
      setMessage('Lưu thất bại: ' + (err?.message || 'lỗi không xác định'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">QUẢN LÝ DOANH NGHIỆP</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hồ sơ doanh nghiệp, gói dịch vụ, phê duyệt & chính sách theo ngành
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateBiz}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm doanh nghiệp
            </button>
            <button
              type="button"
              onClick={load}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Tổng doanh nghiệp', value: stats.total, Icon: Building2, cls: 'text-slate-600' },
            { label: 'Chờ duyệt', value: stats.pending, Icon: Clock, cls: 'text-amber-600' },
            { label: 'Đã xác thực', value: stats.verified, Icon: ShieldCheck, cls: 'text-emerald-600' },
            { label: 'Từ chối', value: stats.rejected, Icon: XCircle, cls: 'text-rose-600' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5">
                <s.Icon className={`w-3.5 h-3.5 ${s.cls}`} />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
              placeholder="Tên DN hoặc MST..."
              className="bg-transparent outline-none text-[11px] w-40 text-slate-700 dark:text-slate-200"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="verified">Đã xác thực</option>
            <option value="rejected">Từ chối</option>
            <option value="draft">Nháp</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5">
            <option value="">Tất cả ngành</option>
            {Object.keys(TYPE_LABEL).map(k => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
          </select>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {pendingList.length} hồ sơ đang chờ duyệt
          </span>
        </div>

        {message && (
          <p className="mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{message}</p>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Chưa có doanh nghiệp nào</p>
            <p className="text-[11px] text-slate-500">Hồ sơ doanh nghiệp gửi từ trang người dùng sẽ hiện ở đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {list.map(b => (
              <div key={b.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{b.name}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${STATUS_CLS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {TYPE_LABEL[b.type] || b.type}
                        </span>
                        {b.tierCode && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {TIERS.find(t => t.code === b.tierCode)?.name || b.tierCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {b.taxCode && <span>MST: {b.taxCode}</span>}
                        {b.businessLicenseNo && <span>GPKD: {b.businessLicenseNo}</span>}
                        {b.project && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{b.project}</span>}
                        {b.legalRepPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{b.legalRepPhone}</span>}
                        {b.contactEmail && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{b.contactEmail}</span>}
                        <span>Gửi: {String(b.createdAt).slice(0, 10)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => openEditBiz(b)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5" /> Sửa
                    </button>
                    <button type="button"
                      onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">
                      {expanded === b.id ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                  </div>
                </div>

                {expanded === b.id && (
                  <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div>Người đại diện: <b>{b.legalRepName || '—'}</b></div>
                      <div>Thương hiệu: <b>{b.brandName || '—'}</b></div>
                      <div>Địa chỉ: <b>{b.address || '—'}</b></div>
                      <div className="flex items-center gap-1">
                        File pháp lý:{' '}
                        {b.licenseFileUrl
                          ? <a href={b.licenseFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-1"><FileText className="w-3 h-3" />Mở</a>
                          : <b>—</b>}
                      </div>
                      {b.industryNote && <div className="sm:col-span-2">Ghi chú ngành: <b>{b.industryNote}</b></div>}
                      {b.adminNote && <div className="sm:col-span-2">Ghi chú admin: <b>{b.adminNote}</b></div>}
                      {b.verifiedAt && <div>Đã duyệt lúc: <b>{String(b.verifiedAt).replace('T', ' ').slice(0, 19)}</b></div>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <select
                        value={tierDraft[b.id] || b.tierCode || 'verified'}
                        onChange={(e) => setTierDraft({ ...tierDraft, [b.id]: e.target.value as BusinessTier })}
                        className="text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5"
                      >
                        {TIERS.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
                      </select>
                      <input
                        value={noteDraft[b.id] || ''}
                        onChange={(e) => setNoteDraft({ ...noteDraft, [b.id]: e.target.value })}
                        placeholder="Lý do / ghi chú (bắt buộc khi từ chối)"
                        className="flex-1 min-w-[200px] text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5"
                      />
                      <button
                        type="button"
                        disabled={busy === b.id + 'approve'}
                        onClick={() => act(b.id, 'approve')}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                      </button>
                      <button
                        type="button"
                        disabled={busy === b.id + 'reject'}
                        onClick={() => act(b.id, 'reject')}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-rose-600 hover:bg-rose-500 text-white inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                      </button>
                      <button
                        type="button"
                        disabled={busy === b.id + 'delete'}
                        onClick={() => handleDeleteBusiness(b.id, b.name || b.brandName || b.id)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-slate-700 hover:bg-slate-600 text-white inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
        <Users className="w-3 h-3" /> Giai đoạn G1–G2: hồ sơ + duyệt + gán gói. Quota/ưu tiên hiển thị và thành viên sẽ bổ sung ở G3–G4.
      </p>

      {/* Modal Thêm/Sửa doanh nghiệp */}
      {bizFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setBizFormOpen(false)} />
          <form onSubmit={handleSaveBiz} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                {editingBiz ? 'Sửa thông tin doanh nghiệp' : 'Thêm doanh nghiệp mới'}
              </div>
              <button type="button" onClick={() => setBizFormOpen(false)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Tên doanh nghiệp *</label>
                <input value={bizDraft.name || ''} onChange={(e) => setBizDraft({ ...bizDraft, name: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" placeholder="VD: Công ty TNHH ABC" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Thương hiệu</label>
                <input value={bizDraft.brandName || ''} onChange={(e) => setBizDraft({ ...bizDraft, brandName: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Loại hình</label>
                <select value={bizDraft.type || 'resident_service'} onChange={(e) => setBizDraft({ ...bizDraft, type: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Mã số thuế</label>
                <input value={bizDraft.taxCode || ''} onChange={(e) => setBizDraft({ ...bizDraft, taxCode: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Số GPKD</label>
                <input value={bizDraft.businessLicenseNo || ''} onChange={(e) => setBizDraft({ ...bizDraft, businessLicenseNo: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Địa chỉ</label>
                <input value={bizDraft.address || ''} onChange={(e) => setBizDraft({ ...bizDraft, address: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Khu / Dự án</label>
                <input value={bizDraft.project || ''} onChange={(e) => setBizDraft({ ...bizDraft, project: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" placeholder="VD: Vinhomes Ocean Park 2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Người đại diện</label>
                <input value={bizDraft.legalRepName || ''} onChange={(e) => setBizDraft({ ...bizDraft, legalRepName: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">SĐT đại diện</label>
                <input value={bizDraft.legalRepPhone || ''} onChange={(e) => setBizDraft({ ...bizDraft, legalRepPhone: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Email liên hệ</label>
                <input value={bizDraft.contactEmail || ''} onChange={(e) => setBizDraft({ ...bizDraft, contactEmail: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Trạng thái</label>
                <select value={bizDraft.status || 'draft'} onChange={(e) => setBizDraft({ ...bizDraft, status: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Gói (Tier)</label>
                <select value={bizDraft.tierCode || 'starter'} onChange={(e) => setBizDraft({ ...bizDraft, tierCode: e.target.value })} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                  {TIERS.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Ghi chú admin</label>
                <textarea value={bizDraft.adminNote || ''} onChange={(e) => setBizDraft({ ...bizDraft, adminNote: e.target.value })} rows={2} className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setBizFormOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">Hủy</button>
              <button type="submit" disabled={busy === 'biz-save'} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black disabled:opacity-50 cursor-pointer">
                {busy === 'biz-save' ? 'Đang lưu…' : editingBiz ? 'Lưu thay đổi' : 'Tạo doanh nghiệp'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
