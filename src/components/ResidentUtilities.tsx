import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, FileText, Compass } from 'lucide-react';
import { User } from '../types';
import { StoreLocatorMapModal } from './StoreLocatorMapModal';
import { ServicePricingModal } from './ServicePricingModal';
import { TripartiteAgreementModal } from './TripartiteAgreementModal';
import { AiMenuScannerModal } from './AiMenuScannerModal';

interface ResidentUtilitiesProps {
  currentUser?: User | null;
  defaultProject?: string;
}

/**
 * Tiện ích cư dân (chỉ hiển thị trong trang Tài khoản khi đã đăng nhập):
 * AI Quét Menu · Bảng Giá PR · Thỏa Thuận 3 Bên · Bản Đồ Định Vị
 */
export const ResidentUtilities: React.FC<ResidentUtilitiesProps> = ({
  currentUser,
  defaultProject = 'ocean-park-2',
}) => {
  const [open, setOpen] = useState<null | 'ai' | 'pricing' | 'tripartite' | 'map'>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stores')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (Array.isArray(d)) setStores(d); })
      .catch(() => {});
    fetch('/api/resident-services?isAdmin=true')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (Array.isArray(d)) setServices(d); })
      .catch(() => {});
  }, []);

  const items = [
    { key: 'ai' as const, label: 'AI Quét Menu', icon: Sparkles, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { key: 'pricing' as const, label: 'Bảng Giá PR', icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { key: 'tripartite' as const, label: 'Thỏa Thuận 3 Bên', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'map' as const, label: 'Bản Đồ Định Vị', icon: Compass, color: 'text-ink-500', bg: 'bg-ink-500/10' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setOpen(it.key)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 hover:border-brand-400 active:scale-95 transition cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.bg} ${it.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight text-ink-700 dark:text-ink-200">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>

      {open === 'map' && (
        <StoreLocatorMapModal
          stores={stores}
          services={services}
          onClose={() => setOpen(null)}
          onSelectStore={() => setOpen(null)}
          onSelectService={() => setOpen(null)}
          initialProject={defaultProject}
        />
      )}
      {open === 'pricing' && (
        <ServicePricingModal currentUser={currentUser || undefined} onClose={() => setOpen(null)} />
      )}
      <TripartiteAgreementModal isOpen={open === 'tripartite'} onClose={() => setOpen(null)} />
      <AiMenuScannerModal
        isOpen={open === 'ai'}
        onClose={() => setOpen(null)}
        onApplyToServiceForm={() => {
          setOpen(null);
          alert('Đã nhận dữ liệu quét menu. Vào "Dịch Vụ Của Tôi" để hoàn tất đăng bài.');
        }}
        defaultProject={defaultProject}
        currentUserPhone={currentUser?.phone || ''}
        currentUserName={currentUser?.name || ''}
      />
    </div>
  );
};
