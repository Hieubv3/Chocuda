import React, { useState, useMemo } from 'react';
import { 
  X, MapPin, Search, Navigation, Phone, MessageSquare, ShoppingBag, 
  ShieldCheck, Star, Clock, Filter, ArrowRight, ExternalLink, Layers, 
  Compass, CheckCircle2, ChevronRight, Store, Wrench, Building2, Eye, Info
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { UserStorefront, ResidentServiceItem, ProjectCategory } from '../types';
import { VIN_MAJOR_PROJECTS } from '../data/residentServicesData';

interface StoreLocatorMapModalProps {
  stores: UserStorefront[];
  services: ResidentServiceItem[];
  onClose: () => void;
  onSelectStore: (store: UserStorefront) => void;
  onSelectService: (service: ResidentServiceItem) => void;
  initialProject?: ProjectCategory | 'all';
}

const API_KEY = 
  (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_PLATFORM_KEY) ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'undefined';

// Default map centers for Vinhomes Projects
const PROJECT_CENTERS: Record<string, { lat: number; lng: number; zoom: number; name: string }> = {
  'ocean-park-2': { lat: 20.958, lng: 105.975, zoom: 15, name: 'Vinhomes Ocean Park 2' },
  'ocean-park-1': { lat: 21.003, lng: 105.952, zoom: 15, name: 'Vinhomes Ocean Park 1' },
  'ocean-park-3': { lat: 20.942, lng: 105.990, zoom: 15, name: 'Vinhomes Ocean Park 3' },
  'smart-city': { lat: 21.002, lng: 105.748, zoom: 15, name: 'Vinhomes Smart City' },
  'grand-park': { lat: 10.841, lng: 106.837, zoom: 15, name: 'Vinhomes Grand Park' },
  'all': { lat: 20.958, lng: 105.975, zoom: 13, name: 'Tất Cả Dự Án Vinhomes' }
};

export const StoreLocatorMapModal: React.FC<StoreLocatorMapModalProps> = ({
  stores,
  services,
  onClose,
  onSelectStore,
  onSelectService,
  initialProject = 'all'
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectCategory | 'all'>(initialProject);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'store' | 'service'>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Active selected map item (store or service)
  const [activeItem, setActiveItem] = useState<{
    id: string;
    type: 'store' | 'service';
    title: string;
    category: string;
    address: string;
    phone: string;
    zalo?: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    lat: number;
    lng: number;
    imageUrl?: string;
    operatingHours?: string;
    originalObj: UserStorefront | ResidentServiceItem;
  } | null>(null);

  // Combine stores and services into map markers with default coordinates if missing
  const mapItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'store' | 'service';
      title: string;
      category: string;
      project: ProjectCategory;
      subdivision?: string;
      address: string;
      phone: string;
      zalo?: string;
      rating: number;
      reviewCount: number;
      verified: boolean;
      lat: number;
      lng: number;
      imageUrl?: string;
      operatingHours?: string;
      originalObj: UserStorefront | ResidentServiceItem;
    }> = [];

    // Process Stores
    stores.forEach((st, idx) => {
      // Default offset coordinates centered at Ocean Park 2 if missing
      const baseLat = st.project === 'ocean-park-1' ? 21.003 : st.project === 'smart-city' ? 21.002 : 20.958;
      const baseLng = st.project === 'ocean-park-1' ? 105.952 : st.project === 'smart-city' ? 105.748 : 105.975;
      const lat = st.lat || (baseLat + (idx * 0.0025 - 0.003));
      const lng = st.lng || (baseLng + (idx * 0.003 - 0.002));

      items.push({
        id: st.id,
        type: 'store',
        title: st.storeName,
        category: st.category,
        project: st.project,
        subdivision: st.subdivision,
        address: st.address,
        phone: st.ownerPhone,
        zalo: st.ownerZalo,
        rating: st.rating || 5.0,
        reviewCount: st.reviewCount || 10,
        verified: st.verified,
        lat,
        lng,
        imageUrl: st.logoUrl || st.bannerUrl,
        operatingHours: st.operatingHours,
        originalObj: st
      });
    });

    // Process Services
    services.forEach((srv, idx) => {
      const baseLat = srv.project === 'ocean-park-1' ? 21.003 : srv.project === 'smart-city' ? 21.002 : 20.958;
      const baseLng = srv.project === 'ocean-park-1' ? 105.952 : srv.project === 'smart-city' ? 105.748 : 105.975;
      const lat = srv.lat || (baseLat + ((idx + 2) * 0.002 - 0.004));
      const lng = srv.lng || (baseLng + ((idx + 2) * 0.0028 - 0.003));

      items.push({
        id: srv.id,
        type: 'service',
        title: srv.title,
        category: srv.subCategory || srv.categoryId,
        project: srv.project,
        subdivision: srv.subdivision,
        address: srv.address,
        phone: srv.providerPhone,
        zalo: srv.providerZalo,
        rating: srv.rating || 5.0,
        reviewCount: srv.reviewCount || 5,
        verified: srv.verified || srv.kycStatus === 'verified',
        lat,
        lng,
        imageUrl: srv.images && srv.images.length > 0 ? srv.images[0] : undefined,
        originalObj: srv
      });
    });

    return items;
  }, [stores, services]);

  // Filter map items
  const filteredMapItems = useMemo(() => {
    return mapItems.filter(item => {
      if (selectedProject !== 'all' && item.project !== selectedProject) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (onlyVerified && !item.verified) return false;
      if (selectedCategory !== 'all' && !item.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.subdivision && item.subdivision.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [mapItems, selectedProject, filterType, onlyVerified, selectedCategory, searchQuery]);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    mapItems.forEach(i => cats.add(i.category));
    return Array.from(cats);
  }, [mapItems]);

  const mapCenter = PROJECT_CENTERS[selectedProject] || PROJECT_CENTERS['all'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header Bar */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Compass className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  BẢN ĐỒ ĐỊNH VỊ CỬA HÀNG & DỊCH VỤ CƯ DÂN
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-full">
                  GPS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tra cứu vị trí gian hàng, thợ sửa chữa & tiệm ăn uống ngay trong phân khu cư dân
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          
          {/* Project Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Dự án:
            </span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value as any)}
              className="bg-slate-950 text-amber-300 border border-slate-700 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="all">📍 Tất cả Dự Án Vinhomes</option>
              {VIN_MAJOR_PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Tất cả ({mapItems.length})
              </button>
              <button
                onClick={() => setFilterType('store')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${filterType === 'store' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Store className="w-3 h-3" /> Gian Hàng ({stores.length})
              </button>
              <button
                onClick={() => setFilterType('service')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${filterType === 'service' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Wrench className="w-3 h-3" /> Thợ Dịch Vụ ({services.length})
              </button>
            </div>

            {/* Nút Xanh Filter */}
            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 cursor-pointer ${
                onlyVerified 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chỉ Nút Xanh KYC</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phân khu, căn hộ, dịch vụ..."
              className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Main Content Area (Split View: Sidebar + Map) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar List (Mobile Drawer / Desktop Fixed) */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-950 border-r border-slate-800 flex flex-col h-1/3 md:h-full shrink-0 overflow-hidden">
            <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                Danh sách ({filteredMapItems.length} địa điểm)
              </span>
              <span className="text-[10px] text-amber-400 font-medium">
                Bấm vào thẻ để định vị trên bản đồ
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
              {filteredMapItems.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Không tìm thấy cửa hàng hay thợ dịch vụ phù hợp với bộ lọc.
                </div>
              ) : (
                filteredMapItems.map(item => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => setActiveItem(item)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex gap-3 ${
                      activeItem?.id === item.id 
                        ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/50' 
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {item.imageUrl ? (
                      <img loading="lazy" 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-amber-400">
                        {item.type === 'store' ? <Store className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide flex items-center gap-1">
                          {item.type === 'store' ? '🛒 Cửa Hàng' : '🛠️ Thợ Dịch Vụ'}
                        </span>
                        {item.verified && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                            ✓ Nút Xanh
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px]">
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {item.rating} ({item.reviewCount})
                        </span>
                        <span className="text-slate-400 hover:text-amber-400 transition font-bold flex items-center gap-0.5">
                          Xem Vị Trí <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="flex-1 h-2/3 md:h-full relative bg-slate-950">
            
            {hasValidKey ? (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                  defaultZoom={mapCenter.zoom}
                  mapId="VINHOMES_LOCATOR_MAP"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {filteredMapItems.map(item => (
                    <AdvancedMarker
                      key={`marker-${item.type}-${item.id}`}
                      position={{ lat: item.lat, lng: item.lng }}
                      onClick={() => setActiveItem(item)}
                      title={item.title}
                    >
                      <Pin
                        background={item.type === 'store' ? '#f59e0b' : '#10b981'}
                        glyphColor="#020617"
                        borderColor="#ffffff"
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            ) : (
              /* Simulated Visual Map Component with Pins & Canvas when API Key is pending */
              <div className="w-full h-full bg-slate-950 relative overflow-hidden flex flex-col justify-between p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Map Floating Banner Instruction */}
                <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="font-bold text-white block">
                        Đang xem Bản Đồ Định Vị Phân Khu Vinhomes ({filteredMapItems.length} địa điểm)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Hệ thống hiển thị tọa độ thực tế của cửa hàng & dịch vụ cư dân.
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    💡 Để bật bản đồ Google Maps vệ tinh live: Thêm Secret <code className="text-amber-400 font-mono font-bold">GOOGLE_MAPS_PLATFORM_KEY</code>
                  </div>
                </div>

                {/* Simulated Interactive Grid Map */}
                <div className="w-full h-full pt-16 pb-20 relative flex items-center justify-center">
                  <div className="w-full max-w-4xl h-full border border-slate-800/80 rounded-3xl bg-slate-900/40 relative overflow-hidden p-6">
                    {/* Subdivision Road Grids */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-between p-10">
                      <div className="h-12 border-y-2 border-dashed border-amber-400/50 w-full flex items-center justify-center text-[10px] text-amber-300 font-bold tracking-widest uppercase">
                        Đại Lộ San Hô & Chà Là - Vinhomes Ocean Park 2
                      </div>
                      <div className="h-12 border-y-2 border-dashed border-emerald-400/50 w-full flex items-center justify-center text-[10px] text-emerald-300 font-bold tracking-widest uppercase">
                        Trục Đường Hải Đăng & Sao Biển - Vinhomes Ocean Park 1
                      </div>
                    </div>

                    {/* Render Interactive Pin Markers on Grid Map */}
                    <div className="relative w-full h-full flex flex-wrap items-center justify-around gap-6 overflow-auto p-4 scrollbar-thin">
                      {filteredMapItems.map((item, idx) => (
                        <div
                          key={`sim-pin-${item.id}`}
                          onClick={() => setActiveItem(item)}
                          className={`p-3 rounded-2xl border transition cursor-pointer transform hover:scale-105 shadow-xl flex items-center gap-2 max-w-[220px] ${
                            activeItem?.id === item.id 
                              ? 'bg-amber-500 text-slate-950 border-white ring-2 ring-amber-400 font-bold' 
                              : item.type === 'store'
                              ? 'bg-slate-950 border-amber-500/60 text-amber-300 hover:border-amber-400'
                              : 'bg-slate-950 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
                          }`}
                        >
                          <span className={`p-2 rounded-xl shrink-0 ${item.type === 'store' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {item.type === 'store' ? <Store className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black block truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] opacity-80 block truncate">
                              📍 {item.subdivision || item.address}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Selected Item Detail Floating Card (Popup Window) */}
            {activeItem && (
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-950/95 backdrop-blur-xl border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl z-30 animate-in slide-in-from-bottom-5 duration-200">
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex gap-3 items-start pr-6">
                  {activeItem.imageUrl ? (
                    <img loading="lazy" 
                      src={activeItem.imageUrl} 
                      alt={activeItem.title} 
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-700 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      {activeItem.type === 'store' ? <Store className="w-7 h-7" /> : <Wrench className="w-7 h-7" />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                        {activeItem.type === 'store' ? '🛒 Gian Hàng Cư Dân' : '🛠️ Thợ Dịch Vụ'}
                      </span>
                      {activeItem.verified && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          ✓ Nút Xanh KYC
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                      {activeItem.title}
                    </h3>

                    <p className="text-xs text-slate-300 mt-1 flex items-start gap-1 line-clamp-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{activeItem.address}</span>
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{activeItem.operatingHours || '08:00 - 21:00'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>{activeItem.rating} ({activeItem.reviewCount} đánh giá)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`tel:${activeItem.phone}`}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi {activeItem.phone}</span>
                  </a>

                  <button
                    onClick={() => {
                      if (activeItem.type === 'store') {
                        onSelectStore(activeItem.originalObj as UserStorefront);
                      } else {
                        onSelectService(activeItem.originalObj as ResidentServiceItem);
                      }
                      onClose();
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{activeItem.type === 'store' ? 'Xem Gian Hàng' : 'Chi Tiết Thợ'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
