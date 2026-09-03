import React, { useEffect, useState } from 'react';
import { Newspaper, Wrench, Building2, Briefcase, Clock, Crown } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  isVip?: boolean;
  vipLevel?: string;
  link?: string;
}

interface RealTimeNewsBoardProps {
  properties: any[];
  news: any[];
  services?: any[];
  onSelectProperty?: (p: any) => void;
  setCurrentTab?: (tab: string) => void;
}

/** Kiểm tra bài có phải mới (trong vòng 12h) không */
function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t < 12 * 60 * 60 * 1000;
}

/** Kiểm tra bài có phải VIP đang hoạt động không */
function isVipActive(item: any): boolean {
  if (!item) return false;
  if (item.isVip) return true;
  if (item.vipLevel && item.vipLevel !== 'none') return true;
  if (item.vipType) return true;
  if (item.vipExpiresAt) {
    const exp = new Date(item.vipExpiresAt).getTime();
    if (!isNaN(exp) && exp > Date.now()) return true;
  }
  return false;
}

/** Component 1 ô bảng tin (tầng dọc, gọn nhẹ, không khung cồng kềnh) */
const NewsColumn: React.FC<{
  title: string;
  icon: React.ReactNode;
  accent: string;
  items: NewsItem[];
  emptyText: string;
  onItemClick?: (item: NewsItem) => void;
}> = ({ title, icon, accent, items, emptyText, onItemClick }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header — gọn, không khung */}
      <div className={`flex items-center gap-1.5 px-2 py-1 ${accent} text-white font-black text-[10px] uppercase tracking-wider shrink-0`}>
        {icon}
        <span className="flex-1 truncate">{title}</span>
        <span className="px-1 py-0.5 bg-white/25 rounded-full text-[8px] font-bold">{items.length}</span>
      </div>

      {/* Danh sách — chạy dài, không khung */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {items.length === 0 && (
          <div className="px-2 py-1.5 text-[10px] text-slate-400 italic">{emptyText}</div>
        )}
        {items.map((item) => {
          const isNewItem = isNew(item.createdAt);
          const isVip = isVipActive(item);
          return (
            <button
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className="w-full text-left px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 group"
            >
              <div className="flex-1 min-w-0 flex items-center gap-1">
                {isNewItem && (
                  <span className="px-1 py-0.5 bg-red-600 text-white text-[7px] font-black rounded uppercase tracking-wider shrink-0 animate-pulse">
                    NEW
                  </span>
                )}
                {isVip && (
                  <span className="px-1 py-0.5 bg-amber-500 text-slate-950 text-[7px] font-black rounded uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <Crown className="w-2 h-2" /> VIP
                  </span>
                )}
                {/* Tiêu đề 1 dòng, không xuống dòng — nổi bật nếu mới đăng trong 12h */}
                <span className={`text-[10px] font-bold truncate transition ${
                  isNewItem
                    ? 'text-amber-600 dark:text-amber-400 font-black'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                }`}>
                  {item.title}
                </span>
              </div>
              {item.createdAt && (
                <span className="text-[8px] text-slate-400 shrink-0 flex items-center gap-0.5">
                  <Clock className="w-2 h-2" />
                  {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Bảng tin real-time tổng hợp — 4 ô xếp dọc, chạy dài, gọn nhẹ */
export const RealTimeNewsBoard: React.FC<RealTimeNewsBoardProps> = ({
  properties,
  news,
  services = [],
  onSelectProperty,
  setCurrentTab
}) => {
  // Fetch services nếu chưa có
  const [fetchedServices, setFetchedServices] = useState<any[]>(services);
  const [recruitmentJobs, setRecruitmentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (services && services.length > 0) {
      setFetchedServices(services);
    } else {
      let cancelled = false;
      fetch('/api/resident-services?isAdmin=true')
        .then(r => r.ok ? r.json() : [])
        .then((data: any[]) => {
          if (!cancelled && Array.isArray(data)) setFetchedServices(data);
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [services]);

  // Fetch recruitment jobs
  useEffect(() => {
    let cancelled = false;
    fetch('/api/recruitment/jobs')
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!cancelled && Array.isArray(data)) setRecruitmentJobs(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Sắp xếp theo thời gian mới nhất
  const sortByDate = (a: any, b: any) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return tb - ta;
  };

  // BĐS mới (bán + cho thuê)
  const propertyItems: NewsItem[] = (properties || [])
    .filter((p: any) => p.status === 'approved' || p.approved)
    .slice()
    .sort(sortByDate)
    .slice(0, 10)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      category: p.type === 'rent' ? 'Cho thuê' : 'Bán',
      createdAt: p.createdAt,
      isVip: isVipActive(p),
      vipLevel: p.vipLevel,
      link: p.id
    }));

  // Tin tức mới
  const newsItems: NewsItem[] = (news || [])
    .filter((n: any) => n.status === 'published')
    .slice()
    .sort(sortByDate)
    .slice(0, 10)
    .map((n: any) => ({
      id: n.id,
      title: n.title,
      category: n.category || 'Tin tức',
      createdAt: n.publishedAt || n.createdAt,
      isVip: isVipActive(n),
      link: n.id
    }));

  // Dịch vụ mới
  const serviceItems: NewsItem[] = (fetchedServices || [])
    .filter((s: any) => s.status === 'approved' || s.approved)
    .slice()
    .sort(sortByDate)
    .slice(0, 10)
    .map((s: any) => ({
      id: s.id,
      title: s.title || s.name || s.serviceName || 'Dịch vụ',
      category: s.categoryName || s.category || 'Dịch vụ',
      createdAt: s.createdAt,
      isVip: isVipActive(s),
      link: s.id
    }));

  // Tuyển dụng mới
  const jobItems: NewsItem[] = (recruitmentJobs || [])
    .filter((j: any) => j.status === 'approved' || j.approved || !j.status)
    .slice()
    .sort(sortByDate)
    .slice(0, 10)
    .map((j: any) => ({
      id: j.id,
      title: j.title || j.jobTitle || j.position || 'Việc làm',
      category: j.category || 'Tuyển dụng',
      createdAt: j.createdAt,
      isVip: isVipActive(j),
      link: j.id
    }));

  return (
    <div className="flex flex-col h-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-2xl overflow-hidden divide-y divide-slate-200/70 dark:divide-slate-700/70">
      {/* Ô BĐS */}
      <NewsColumn
        title="BĐS Mới"
        icon={<Building2 className="w-3 h-3" />}
        accent="bg-gradient-to-r from-amber-500 to-orange-600"
        items={propertyItems}
        emptyText="Chưa có bài BĐS"
        onItemClick={(item) => {
          const p = (properties || []).find((x: any) => x.id === item.id);
          if (p && onSelectProperty) onSelectProperty(p);
        }}
      />

      {/* Ô Tin tức */}
      <NewsColumn
        title="Tin Tức Mới"
        icon={<Newspaper className="w-3 h-3" />}
        accent="bg-gradient-to-r from-blue-600 to-indigo-700"
        items={newsItems}
        emptyText="Chưa có tin tức"
        onItemClick={() => setCurrentTab && setCurrentTab('news')}
      />

      {/* Ô Dịch vụ */}
      <NewsColumn
        title="Dịch Vụ Mới"
        icon={<Wrench className="w-3 h-3" />}
        accent="bg-gradient-to-r from-emerald-600 to-teal-700"
        items={serviceItems}
        emptyText="Chưa có dịch vụ"
        onItemClick={() => setCurrentTab && setCurrentTab('services')}
      />

      {/* Ô Tuyển dụng */}
      <NewsColumn
        title="Tuyển Dụng Mới"
        icon={<Briefcase className="w-3 h-3" />}
        accent="bg-gradient-to-r from-teal-600 to-cyan-700"
        items={jobItems}
        emptyText="Chưa có việc làm"
        onItemClick={() => setCurrentTab && setCurrentTab('recruitment')}
      />
    </div>
  );
};
