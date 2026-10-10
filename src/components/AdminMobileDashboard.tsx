import React from 'react';

export interface AdminMobileStats {
  sale: number;
  rent: number;
  pending: number;
  services: number;
  stores: number;
  jobs: number;
  revenue: number;
}

interface AdminMobileDashboardProps {
  stats: AdminMobileStats;
  onNavigate: (target: 'sale' | 'rent' | 'pending' | 'services' | 'stores' | 'jobs' | 'analytics') => void;
}

/**
 * Màn "Tổng quan" kiểu mới cho Admin trên mobile (theo bộ mockup 9 màn).
 * - Chỉ hiển thị dưới 1024px (lg:hidden) — desktop hoàn toàn không đổi.
 * - Thẻ số liệu lớn + thao tác nhanh, dùng chung dữ liệu thật của Admin.
 */
export const AdminMobileDashboard: React.FC<AdminMobileDashboardProps> = ({ stats, onNavigate }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

  return (
    <div className="cd24-admin-mobile-overview lg:hidden space-y-3">
      {/* Lời chào + ngày */}
      <div className="px-0.5 flex items-end justify-between gap-2">
        <div>
          <div className="text-[11.5px] text-slate-500 dark:text-slate-400 font-semibold capitalize">{dateStr}</div>
          <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">Xin chào 👋</div>
        </div>
        <div className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-1 rounded-full">
          ● Realtime
        </div>
      </div>

      {/* 4 thẻ số liệu lớn */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate('sale')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm active:scale-[0.98] transition cursor-pointer"
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">🏠 BĐS đang bán</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums leading-none">{stats.sale}</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('rent')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm active:scale-[0.98] transition cursor-pointer"
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">🔑 BĐS cho thuê</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums leading-none">{stats.rent}</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('pending')}
          className={`rounded-2xl border p-3 text-left shadow-sm active:scale-[0.98] transition cursor-pointer ${
            stats.pending > 0
              ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">⏳ Chờ duyệt</div>
          <div className={`text-2xl font-black mt-1.5 tabular-nums leading-none ${
            stats.pending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
          }`}>{stats.pending}</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('services')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm active:scale-[0.98] transition cursor-pointer"
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">🛠 Dịch vụ cư dân</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums leading-none">{stats.services}</div>
        </button>
      </div>

      {/* Doanh thu đã thu (nguồn: /api/analytics/stats) */}
      <button
        type="button"
        onClick={() => onNavigate('analytics')}
        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm active:scale-[0.98] transition cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">💰 Doanh thu đã thu</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums leading-none">
            {stats.revenue.toLocaleString('vi-VN')} <span className="text-[11px] font-bold text-slate-400">VND</span>
          </div>
        </div>
        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 shrink-0">Phân tích →</span>
      </button>

      {/* Thao tác nhanh */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onNavigate('pending')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-center shadow-sm active:scale-95 transition cursor-pointer"
        >
          <div className="text-base leading-none">✅</div>
          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5">Duyệt bài</div>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('jobs')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-center shadow-sm active:scale-95 transition cursor-pointer"
        >
          <div className="text-base leading-none">💼</div>
          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5">Việc làm</div>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('stores')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-center shadow-sm active:scale-95 transition cursor-pointer"
        >
          <div className="text-base leading-none">🏪</div>
          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5">Gian hàng</div>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-center shadow-sm active:scale-95 transition cursor-pointer"
        >
          <div className="text-base leading-none">📊</div>
          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5">Phân tích</div>
        </button>
      </div>

      {/* Hàng đợi công việc: ưu tiên hành động thay vì chỉ hiển thị số liệu */}
      <section className="cd24-mobile-work-queue rounded-2xl border border-orange-200/80 bg-orange-50/70 p-3 dark:border-orange-900/50 dark:bg-orange-950/20">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300">🔔</span>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Cần xử lý hôm nay</h2>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Các việc quan trọng đang chờ bạn</p>
            </div>
          </div>
          <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-black text-orange-700 dark:bg-orange-900/60 dark:text-orange-300">{stats.pending + stats.stores + stats.jobs}</span>
        </div>
        <div className="space-y-1.5">
          <button type="button" onClick={() => onNavigate('pending')} className="cd24-mobile-work-item">
            <span className="cd24-mobile-work-icon">🏠</span>
            <span className="min-w-0 flex-1 text-left"><b>Duyệt tin bất động sản</b><small>{stats.pending} tin đang chờ duyệt</small></span>
            <span className="cd24-mobile-work-status">Xem →</span>
          </button>
          <button type="button" onClick={() => onNavigate('stores')} className="cd24-mobile-work-item">
            <span className="cd24-mobile-work-icon">🏪</span>
            <span className="min-w-0 flex-1 text-left"><b>Kiểm tra gian hàng</b><small>{stats.stores} gian hàng đang hoạt động</small></span>
            <span className="cd24-mobile-work-status">Xem →</span>
          </button>
          <button type="button" onClick={() => onNavigate('jobs')} className="cd24-mobile-work-item">
            <span className="cd24-mobile-work-icon">💼</span>
            <span className="min-w-0 flex-1 text-left"><b>Theo dõi việc làm & leads</b><small>{stats.jobs} yêu cầu mới</small></span>
            <span className="cd24-mobile-work-status">Xem →</span>
          </button>
        </div>
        <button type="button" onClick={() => onNavigate('pending')} className="mt-2.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-[.98]">
          Xem toàn bộ công việc cần xử lý <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
};

export default AdminMobileDashboard;
