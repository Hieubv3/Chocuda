import React from 'react';

/** Cấu hình website, quản trị được trong trang admin. */
export interface SiteSettings {
  /** Số hiển thị, ví dụ 0868.499.929 */
  hotline: string;
  /** Số dạng gọi được, ví dụ 0868499929 */
  hotlineRaw: string;
  /** Số Zalo, dạng gọi được */
  zalo: string;
  email: string;
  address: string;
  company: string;
  taxId: string;
  workingHours: string;
  footerNote: string;
  facebook: string;
  youtube: string;
  /** Danh sách số điện thoại ban quản trị (hiển thị ở menu di động) */
  adminPhones?: { id: string; label: string; phone: string }[];
  tiktok: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hotline: '0868.499.929',
  hotlineRaw: '0868499929',
  zalo: '0868499929',
  email: 'hotro.chocudan24h@gmail.com',
  address: 'Phân khu Chà Là, Vinhomes Ocean Park 2, Văn Giang, Hưng Yên',
  company: 'Chợ Cư Dân 24H Vinhomes',
  taxId: '0109882341',
  workingHours: 'Trực tuyến 24/7',
  footerNote: 'Nền tảng kết nối cư dân Vinhomes',
  facebook: 'https://facebook.com/chocudan24h',
  youtube: 'https://youtube.com/@chocudan24h',
  tiktok: 'https://tiktok.com/@chocudan24h',
  adminPhones: [
    { id: 'bql', label: 'Ban quản trị', phone: '0868.499.929' },
  ],
};

const STORAGE_KEY = 'chocudan24h_site_settings';

let cache: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
const listeners = new Set<(s: SiteSettings) => void>();

function emit() {
  listeners.forEach((fn) => {
    try { fn(cache); } catch { /* ignore */ }
  });
}

export function getSiteSettings(): SiteSettings {
  return cache;
}

export function subscribeSiteSettings(fn: (s: SiteSettings) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function readLocal(): Partial<SiteSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const local = readLocal();
  if (local) cache = { ...cache, ...local };
  try {
    const res = await fetch('/api/site-settings');
    if (res.ok) {
      const data = await res.json();
      cache = { ...DEFAULT_SITE_SETTINGS, ...(local || {}), ...(data || {}) };
    }
  } catch {
    /* giữ dữ liệu cục bộ */
  }
  emit();
  return cache;
}

export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  cache = { ...cache, ...patch };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  emit();
  try {
    await fetch('/api/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache),
    });
  } catch {
    /* đã lưu cục bộ */
  }
  return cache;
}

/** Hook dùng trong component để luôn nhận cấu hình mới nhất. */
export function useSiteSettings(): SiteSettings {
  const [state, setState] = React.useState<SiteSettings>(getSiteSettings());
  React.useEffect(() => {
    const unsubscribe = subscribeSiteSettings(setState);
    loadSiteSettings().then(setState);
    return () => { unsubscribe(); };
  }, []);
  return state;
}

/** Chuẩn hoá số điện thoại thành dạng gọi được: 0868.499.929 -> 0868499929 */
export function toDialable(value: string): string {
  return (value || '').replace(/[^\d+]/g, '');
}
