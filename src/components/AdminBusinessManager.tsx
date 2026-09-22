import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, XCircle, Search, RefreshCw, ShieldCheck, Clock, Users, Phone, Mail, MapPin, FileText } from 'lucide-react';
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

  const pendingList = useMemo(() => list.filter(b => b.status === 'pending'), [list]);

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
          <button
            type="button"
            onClick={load}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </button>
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
    </div>
  );
};
