import React, { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';

interface SourceDef {
  label: string;
  url: string;
  pick?: (d: any) => number;
  dot: string;
}

/**
 * Bảng THỐNG KÊ TOÀN HỆ THỐNG — đếm tất cả hạng mục đang hiển thị trên web
 * (bài đăng, dự án, tin tức, quỹ căn, dịch vụ, gian hàng, tuyển dụng, banner,
 *  FAQ, khách hàng, thành viên, đánh giá...).
 */
const SOURCES: SourceDef[] = [
  { label: 'Bài đăng BĐS', url: '/api/properties?status=all&isAdmin=true', dot: 'bg-emerald-500' },
  { label: 'Dự án', url: '/api/projects', dot: 'bg-sky-500' },
  { label: 'Tin tức', url: '/api/news', dot: 'bg-indigo-500' },
  { label: 'Quỹ căn CĐT', url: '/api/developer-units', dot: 'bg-violet-500' },
  { label: 'Đại lý F1', url: '/api/developer-f1-agents', dot: 'bg-fuchsia-500' },
  { label: 'Dịch vụ cư dân', url: '/api/resident-services', dot: 'bg-orange-500' },
  { label: 'Gian hàng', url: '/api/stores', dot: 'bg-purple-500' },
  { label: 'Tuyển dụng', url: '/api/recruitment/jobs', dot: 'bg-teal-500' },
  { label: 'Ứng viên', url: '/api/recruitment/candidates', dot: 'bg-cyan-500' },
  { label: 'Banner QC', url: '/api/ads', dot: 'bg-amber-500' },
  { label: 'FAQ', url: '/api/faq', pick: (d) => (d && Array.isArray(d.faq) ? d.faq.length : 0), dot: 'bg-rose-500' },
  { label: 'Khách hàng (Lead)', url: '/api/contacts', dot: 'bg-lime-500' },
  { label: 'Thành viên', url: '/api/auth/users', dot: 'bg-blue-500' },
  { label: 'Đánh giá đối tác', url: '/api/reputation-posts', dot: 'bg-yellow-500' },
];

function countOf(d: any): number {
  if (Array.isArray(d)) return d.length;
  if (d && Array.isArray(d.faq)) return d.faq.length;
  if (d && Array.isArray(d.data)) return d.data.length;
  if (d && typeof d === 'object') return Object.keys(d).length;
  return 0;
}

export const AdminOverviewStats: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  const load = async () => {
    setLoading(true);
    const next: Record<string, number | null> = {};
    await Promise.all(
      SOURCES.map(async (s) => {
        try {
          const res = await fetch(s.url, { headers: { Accept: 'application/json' } });
          if (!res.ok) {
            next[s.label] = null;
            return;
          }
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('json')) {
            next[s.label] = null;
            return;
          }
          const data = await res.json();
          next[s.label] = s.pick ? s.pick(data) : countOf(data);
        } catch {
          next[s.label] = null;
        }
      })
    );
    setCounts(next);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const total = SOURCES.reduce((acc, s) => acc + (counts[s.label] || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between gap-2 p-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-1.5 text-left cursor-pointer"
          title="Bấm để mở rộng / thu gọn bảng thống kê toàn hệ thống"
        >
          <span className="p-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-bold text-xs flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="font-extrabold">Tổng: {total}</span>
          </span>
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
            Thống kê toàn hệ thống
          </span>
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
          title="Tải lại số liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải' : 'Tải lại'}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2.5 pt-0">
          {SOURCES.map((s) => {
            const v = counts[s.label];
            return (
              <div
                key={s.label}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-2"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                    {s.label}
                  </span>
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                  {v === null ? '—' : v}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOverviewStats;
