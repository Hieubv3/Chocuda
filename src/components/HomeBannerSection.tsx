import React from 'react';
import { Building2, KeyRound, Wrench, Briefcase } from 'lucide-react';

interface HomeBannerSectionProps {
  onNavigateTab: (tab: string) => void;
  onSelectProperty?: (property: any) => void;
  properties?: any[];
  news?: any[];
  services?: any[];
  jobs?: any[];
  bannerImage?: string;
}

const fmtDate = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return String(dt.getDate()).padStart(2, '0') + '-' + String(dt.getMonth() + 1).padStart(2, '0');
};

const FeedModule: React.FC<{ title: string; count: number; header: string; countCls: string; hover: string; empty: string; items: any[]; onItem?: () => void }> = ({ title, count, header, countCls, hover, empty, items, onItem }) => (
  <div className="border-b border-slate-800 last:border-b-0">
    <div className={header + ' text-white px-3.5 py-2 flex items-center justify-between font-bold text-xs uppercase tracking-wide'}>
      <span>{title}</span>
      <span className={countCls + ' px-2 py-0.5 rounded text-[11px] font-bold'}>{count}</span>
    </div>
    <div className="bg-[#091222] divide-y divide-slate-800/50">
      {items.length === 0 ? (
        <div className="px-3.5 py-2.5 text-xs text-slate-500 italic">{empty}</div>
      ) : items.map((it: any, i: number) => (
        <button key={it.id || i} type="button" onClick={onItem}
          className="w-full text-left px-3.5 py-2.5 hover:bg-[#121f38] transition flex items-center justify-between gap-2 cursor-pointer group">
          <span className={'"text-xs text-slate-200 ' + hover + ' truncate flex-1'}>{(it.title || it.name || '')}</span>
          <span className="text-xs text-slate-400 shrink-0">{fmtDate(it.createdAt || it.updatedAt) || it.dateLabel || it.date || ''}</span>
        </button>
      ))}
    </div>
  </div>
);

const BANNER_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230d172e'/%3E%3Cstop offset='0.55' stop-color='%231e3a8a'/%3E%3Cstop offset='1' stop-color='%230f766e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='420' fill='url(%23g)'/%3E%3C/svg%3E";

export const HomeBannerSection: React.FC<HomeBannerSectionProps> = ({
  onNavigateTab, onSelectProperty,
  properties = [], news = [], services = [], jobs = [],
  bannerImage
}) => {
  const img = bannerImage || BANNER_FALLBACK;
  const quick = [
    { id: 'sale', title: 'Mua Bán BĐS', sub: 'Chuyển nhượng CĐT & Cư dân', Icon: Building2, tile: 'from-amber-500/20 to-orange-500/20 border-amber-500/40', ic: 'text-amber-400', bd: 'border-amber-500/30 hover:border-amber-400/70', hv: 'group-hover:text-amber-300' },
    { id: 'rent', title: 'Cho Thuê BĐS', sub: 'Thuê căn hộ & Shophouse', Icon: KeyRound, tile: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40', ic: 'text-sky-400', bd: 'border-sky-500/30 hover:border-sky-400/70', hv: 'group-hover:text-sky-300' },
    { id: 'services', title: 'Dịch Vụ Cư Dân', sub: 'Sửa chữa, dọn dẹp, tiện ích', Icon: Wrench, tile: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40', ic: 'text-teal-400', bd: 'border-teal-500/30 hover:border-teal-400/70', hv: 'group-hover:text-teal-300' },
    { id: 'recruitment', title: 'Việc Làm Nội Khu', sub: 'Tuyển dụng & tìm việc làm', Icon: Briefcase, tile: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40', ic: 'text-indigo-400', bd: 'border-indigo-500/30 hover:border-indigo-400/70', hv: 'group-hover:text-indigo-300' },
  ];
  return (
    <section className="pt-2 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
      <div className="bg-[#16284e] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <div className="relative min-h-[175px] sm:min-h-[195px] md:min-h-[210px] w-full rounded-xl overflow-hidden border border-slate-700/60 shadow-lg flex items-center">
              <img src={img} alt="Kết nối cư dân Vinhomes" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d172e]/95 via-[#0d172e]/80 to-transparent" />
              <div className="relative z-10 px-5 sm:px-8 max-w-xl space-y-1.5">
                <h1 className="text-white font-black text-xl sm:text-2xl md:text-[26px] tracking-tight uppercase drop-shadow-md">KẾT NỐI CƯ DÂN VINHOMES</h1>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed drop-shadow-sm">Nền tảng trực tiếp dành cho cư dân trao đổi thông tin mua bán, cho thuê BĐS, tiện ích dịch vụ sinh hoạt và việc làm nội khu...</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5">
              {quick.map((q) => (
                <button key={q.id} type="button" onClick={() => onNavigateTab(q.id)}
                  className={'group relative bg-[#1c2945] hover:bg-[#25375d] border ' + q.bd + ' rounded-xl p-3 flex items-center sm:flex-col sm:justify-center text-left sm:text-center gap-2.5 sm:gap-1.5 transition-all duration-200 shadow-md hover:-translate-y-0.5 cursor-pointer'}>
                  <div className={'w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ' + q.tile + ' border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'}>
                    <q.Icon className={'w-5 h-5 ' + q.ic} />
                  </div>
                  <div className="min-w-0">
                    <div className={'text-white font-bold text-xs sm:text-sm tracking-tight ' + q.hv + ' transition-colors'}>{q.title}</div>
                    <div className="text-[10px] text-slate-400 hidden sm:block">{q.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="w-full bg-[#0d172e] rounded-xl border border-slate-700/60 overflow-hidden shadow-lg h-full">
              <FeedModule title="BĐS Mới" count={properties.length} header="bg-orange-600" countCls="bg-orange-900/60" hover="group-hover:text-amber-400" empty="Chưa có tin" items={properties.slice(0, 3)} onItem={() => onNavigateTab('sale')} />
              <FeedModule title="Tin Tức Mới" count={news.length} header="bg-purple-600" countCls="bg-purple-900/60" hover="group-hover:text-purple-300" empty="Chưa có tin tức" items={news.slice(0, 3)} onItem={() => onNavigateTab('news')} />
              <FeedModule title="Dịch Vụ Mới" count={services.length} header="bg-teal-600" countCls="bg-teal-900/60" hover="group-hover:text-teal-300" empty="Chưa có dịch vụ" items={services.slice(0, 3)} onItem={() => onNavigateTab('services')} />
              <FeedModule title="Tuyển Dụng Mới" count={jobs.length} header="bg-blue-600" countCls="bg-blue-900/60" hover="group-hover:text-indigo-300" empty="Chưa có việc làm" items={jobs.slice(0, 3)} onItem={() => onNavigateTab('recruitment')} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
