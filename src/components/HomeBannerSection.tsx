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
  <div className="border-b border-ink-800 last:border-b-0">
    <div className={header + ' text-white px-3.5 py-2 flex items-center justify-between font-bold text-xs uppercase tracking-wide'}>
      <span>{title}</span>
      <span className={countCls + ' px-2 py-0.5 rounded text-[11px] font-bold'}>{count}</span>
    </div>
    <div className="bg-[#091222] divide-y divide-ink-800/50">
      {items.length === 0 ? (
        <div className="px-3.5 py-2.5 text-xs text-ink-500 italic">{empty}</div>
      ) : items.map((it: any, i: number) => (
        <button key={it.id || i} type="button" onClick={onItem}
          className="w-full text-left px-3.5 py-2.5 hover:bg-[#121f38] transition flex items-center justify-between gap-2 cursor-pointer group">
          <span className={'"text-xs text-ink-200 ' + hover + ' truncate flex-1'}>{(it.title || it.name || '')}</span>
          <span className="text-xs text-ink-400 shrink-0">{fmtDate(it.createdAt || it.updatedAt) || it.dateLabel || it.date || ''}</span>
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
    { id: 'sale', title: 'Mua Bán BĐS', sub: 'Chuyển nhượng CĐT & Cư dân', image: '/images/demo/property-house.jpg', Icon: Building2, tile: 'from-brand-500/20 to-orange-500/20 border-brand-500/40', ic: 'text-brand-400', bd: 'border-brand-500/30 hover:border-brand-400/70', hv: 'group-hover:text-brand-300' },
    { id: 'rent', title: 'Cho Thuê BĐS', sub: 'Thuê căn hộ & Shophouse', image: '/images/demo/property-interior-2.jpg', Icon: KeyRound, tile: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40', ic: 'text-sky-400', bd: 'border-sky-500/30 hover:border-sky-400/70', hv: 'group-hover:text-sky-300' },
    { id: 'services', title: 'Dịch Vụ Cư Dân', sub: 'Sửa chữa, dọn dẹp, tiện ích', image: '/images/demo/ad-service.jpg', Icon: Wrench, tile: 'from-teal-500/20 to-brand-500/20 border-teal-500/40', ic: 'text-teal-400', bd: 'border-teal-500/30 hover:border-teal-400/70', hv: 'group-hover:text-teal-300' },
    { id: 'recruitment', title: 'Việc Làm Nội Khu', sub: 'Tuyển dụng & tìm việc làm', image: '/images/demo/project-tower.jpg', Icon: Briefcase, tile: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40', ic: 'text-indigo-400', bd: 'border-indigo-500/30 hover:border-indigo-400/70', hv: 'group-hover:text-indigo-300' },
  ];
  return (
    <section className="pt-2 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-0 lg:max-w-none mx-auto w-full">
      <div className="bg-[#16284e] rounded-2xl p-4 sm:p-5 shadow-2xl border border-ink-700/50 lg:rounded-none lg:border-0 lg:shadow-none lg:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          <div className="lg:col-span-9 flex flex-col">
            <div className="relative min-h-[370px] sm:min-h-[390px] md:min-h-[410px] w-full rounded-xl lg:rounded-none overflow-hidden border border-ink-700/60 lg:border-0 shadow-lg lg:shadow-none flex items-start">
              <img src={img} alt="Kết nối cư dân Vinhomes" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0d172e]/95 via-[#0d172e]/45 to-[#0d172e]/80" />
              <div className="relative z-10 px-5 pt-6 sm:px-8 sm:pt-8 max-w-xl space-y-1.5">
                <h1 className="text-white font-black text-xl sm:text-2xl md:text-[26px] tracking-tight uppercase drop-shadow-md">KẾT NỐI CƯ DÂN VINHOMES</h1>
                <p className="text-ink-200 text-xs sm:text-sm leading-relaxed drop-shadow-sm">Nền tảng trực tiếp dành cho cư dân trao đổi thông tin mua bán, cho thuê BĐS, tiện ích dịch vụ sinh hoạt và việc làm nội khu...</p>
              </div>
              <div className="absolute z-10 inset-x-3 sm:inset-x-5 bottom-3 sm:bottom-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {quick.map((q) => (
                  <button key={q.id} type="button" onClick={() => onNavigateTab(q.id)}
                    className={'group relative min-h-[82px] sm:min-h-[96px] overflow-hidden border ' + q.bd + ' rounded-xl p-2.5 sm:p-3 flex items-end text-left transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer'}>
                    <img src={q.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#071a16]/95 via-[#071a16]/55 to-[#071a16]/15" />
                    <span className="relative z-10 flex items-center gap-2 min-w-0">
                      <span className={'w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/35 border border-white/35 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'}>
                        <q.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </span>
                      <span className="min-w-0">
                        <span className={'block text-white font-black text-[11px] sm:text-sm tracking-tight ' + q.hv + ' transition-colors truncate'}>{q.title}</span>
                        <span className="block text-[9px] sm:text-[10px] text-white/85 truncate">{q.sub}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="w-full bg-[#0d172e] rounded-xl border border-ink-700/60 overflow-hidden shadow-lg h-full">
              <FeedModule title="BĐS Mới" count={properties.length} header="bg-orange-600" countCls="bg-orange-900/60" hover="group-hover:text-brand-400" empty="Chưa có tin" items={properties.slice(0, 3)} onItem={() => onNavigateTab('sale')} />
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
