import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PublicUnit {
  id: string;
  code: string;
  projectId: string;
  subdivisionId: string;
  type?: string;
  area?: number;
  price?: number;
  priceDisplay?: string;
  status: string;
  tier?: string;
  floor?: string;
}

const PROJECT_NAMES: Record<string, string> = {
  'ocean-park-1': 'Vinhomes Ocean Park 1',
  'ocean-park-2': 'Vinhomes Ocean Park 2',
  'ocean-park-3': 'Vinhomes Ocean Park 3',
  'smart-city': 'Vinhomes Smart City',
  'royal-island': 'Vinhomes Royal Island',
};

const SUB_NAMES: Record<string, string> = {
  'op2-cha-la': 'Chà Là',
  'op2-co-xanh': 'Cỏ Xanh',
  'op2-hai-tang': 'Hải Tăng',
  'op2-san-ho': 'San Hô',
  'op1-san-ho': 'San Hô',
  'op1-ngoc-trai': 'Ngọc Trai',
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  conhang: { label: 'Còn hàng', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  dabooking: { label: 'Đã booking', cls: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  dacoc: { label: 'Đã cọc', cls: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' },
  daban: { label: 'Đã bán', cls: 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
  thuhoi: { label: 'Thu hồi', cls: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
};

const STATUS_ORDER: Record<string, number> = { conhang: 0, dabooking: 1, dacoc: 2, daban: 3, thuhoi: 4 };

/**
 * Khu "Quỹ căn chủ đầu tư" trên trang chủ.
 * Dữ liệu lấy trực tiếp từ /api/developer-units — cùng nguồn với trang
 * quản trị (Mặt bằng dự án) nên admin sửa là web cập nhật ngay.
 */
export const DeveloperUnitsHomeSection: React.FC = () => {
  const [units, setUnits] = useState<PublicUnit[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projNames, setProjNames] = useState<Record<string, string>>({});
  const [subNames, setSubNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/developer-projects')
      .then((r) => (r.ok ? r.json() : []))
      .then((d: any) => {
        if (!Array.isArray(d)) return;
        const pn: Record<string, string> = {};
        const sn: Record<string, string> = {};
        d.forEach((p: any) => {
          pn[p.id] = p.name;
          (p.subs || []).forEach((s: any) => { if (s && s.id) sn[s.id] = String(s.name || '').replace(/^Phân khu /, ''); });
        });
        setProjNames(pn);
        setSubNames(sn);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/developer-units')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const list: PublicUnit[] = Array.isArray(d) ? d : d && Array.isArray(d.units) ? d.units : [];
        setUnits(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const list = units.filter((u) => statusFilter === 'all' || u.status === statusFilter);
    return list.slice().sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 9;
      const sb = STATUS_ORDER[b.status] ?? 9;
      if (sa !== sb) return sa - sb;
      return String(a.code).localeCompare(String(b.code));
    });
  }, [units, statusFilter]);

  if (loading || units.length === 0) return null;

  const visible = showAll ? filtered : filtered.slice(0, 8);
  const totalAvail = units.filter((u) => u.status === 'conhang').length;

  const chipCls = (active: boolean) =>
    `text-[10.5px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
      active
        ? 'bg-brand-500 text-ink-950 border-brand-500'
        : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-ink-700'
    }`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-ink-200 dark:border-ink-800 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">Chủ đầu tư</span>
          <h2 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">🏗️ Quỹ căn chủ đầu tư — Căn bán mới nhất</h2>
          <p className="text-[11px] text-ink-500 dark:text-ink-400">
            Dữ liệu đồng bộ trực tiếp từ hệ thống quản trị · còn {totalAvail} căn đang mở bán
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => setStatusFilter('all')} className={chipCls(statusFilter === 'all')}>Tất cả ({units.length})</button>
          <button type="button" onClick={() => setStatusFilter('conhang')} className={chipCls(statusFilter === 'conhang')}>Còn hàng ({totalAvail})</button>
          <button type="button" onClick={() => setStatusFilter('dabooking')} className={chipCls(statusFilter === 'dabooking')}>Booking</button>
          <button type="button" onClick={() => setStatusFilter('daban')} className={chipCls(statusFilter === 'daban')}>Đã bán</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-ink-400 py-4 text-center">Không có căn nào trong nhóm này.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((u) => {
            const st = STATUS_META[u.status] || STATUS_META.conhang;
            return (
              <div key={u.id} className="card24 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-black text-ink-900 dark:text-white">{u.code}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border whitespace-nowrap ${st.cls}`}>{st.label}</span>
                </div>
                <div className="text-[10.5px] text-ink-500 dark:text-ink-400 truncate">
                  {subNames[u.subdivisionId] || SUB_NAMES[u.subdivisionId] || u.subdivisionId} · {projNames[u.projectId] || PROJECT_NAMES[u.projectId] || u.projectId}
                </div>
                <div className="flex items-end justify-between gap-1 mt-auto">
                  <span className="price24 text-[13px]">{u.priceDisplay || (u.price ? `${u.price} tỷ` : '—')}</span>
                  <span className="text-[10.5px] font-bold text-ink-500 dark:text-ink-400">{u.area || '—'} m²</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 8 && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 text-ink-800 dark:text-ink-200 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            {showAll ? 'Thu gọn' : `Xem thêm ${filtered.length - 8} căn`}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </section>
  );
};

export default DeveloperUnitsHomeSection;
