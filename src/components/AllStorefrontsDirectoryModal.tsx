import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Store, Search, Filter, Star, Phone, MessageSquare, MapPin, 
  ExternalLink, CheckCircle2, ChevronRight, ShoppingBag, Sparkles, Building2 
} from 'lucide-react';
import { UserStorefront } from '../types';
import { getStoreDetailUrl } from '../lib/slugs';

interface AllStorefrontsDirectoryModalProps {
  stores: UserStorefront[];
  onClose: () => void;
  onSelectStore?: (store: UserStorefront) => void;
}

export const AllStorefrontsDirectoryModal: React.FC<AllStorefrontsDirectoryModalProps> = ({
  stores,
  onClose,
  onSelectStore
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleGoToStore = (st: UserStorefront) => {
    onClose();
    if (onSelectStore) onSelectStore(st);
    navigate(getStoreDetailUrl(st));
  };

  // Extract all unique store categories
  const categories = Array.from(
    new Set(stores.map(s => s.category).filter(Boolean))
  );

  // Filter stores based on category and search query
  const filteredStores = stores.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.storeName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.subdivision && s.subdivision.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-2xl text-purple-300">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 font-black text-[10px] rounded-full uppercase tracking-wider">
                  DANH MỤC GIAN HÀNG CƯ DÂN
                </span>
                <span className="text-xs text-amber-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {stores.length} Gian hàng hoạt động
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                TẤT CẢ GIAN HÀNG & DỊCH VỤ CƯ DÂN VINHOMES
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên gian hàng, món ăn, dịch vụ, căn hộ, số phòng..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap shrink-0 border cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
              }`}
            >
              🏷️ Tất cả ngành nghề ({stores.length})
            </button>
            {categories.map((cat) => {
              const count = stores.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap shrink-0 border cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                  }`}
                >
                  🏪 {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Storefronts Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredStores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
              <Store className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm">Chưa tìm thấy gian hàng phù hợp với từ khóa.</p>
              <p className="text-xs">Thử đổi từ khóa hoặc chọn ngành nghề khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleGoToStore(st)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Banner / Header image */}
                  <div className="h-28 rounded-2xl overflow-hidden relative mb-3 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={st.bannerUrl || st.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                      alt={st.storeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Category badge */}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md text-amber-400 font-extrabold text-[9px] rounded-full border border-amber-400/30">
                      {st.category}
                    </span>

                    {st.verified && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white font-extrabold text-[9px] rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3 h-3" /> Uy Tín
                      </span>
                    )}

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[10px]">
                      <span className="font-black flex items-center gap-1 text-amber-300">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {st.rating || 5.0} ({st.reviewCount || 20}+ đánh giá)
                      </span>
                      <span className="font-extrabold text-purple-200 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30">
                        {st.products?.length || 0} Sản Phẩm
                      </span>
                    </div>
                  </div>

                  {/* Store info */}
                  <div className="space-y-2 flex-1">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition line-clamp-1">
                      {st.storeName}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {st.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="line-clamp-1">{st.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Chủ shop: {st.ownerName} ({st.ownerPhone})</span>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" /> Đặt hàng trực tuyến
                    </span>
                    <span className="px-3 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-xl group-hover:bg-purple-700 transition flex items-center gap-1 shadow-sm">
                      Vào Shop <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Hiển thị {filteredStores.length} gian hàng theo ngành nghề</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
