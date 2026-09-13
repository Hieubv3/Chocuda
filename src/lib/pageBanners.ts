export interface PageBannerConfig {
  key: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
}

let cache: PageBannerConfig[] | null = null;
let inflight: Promise<PageBannerConfig[]> | null = null;

export function getCachedPageBanners(): PageBannerConfig[] | null {
  return cache;
}

export function invalidatePageBanners() {
  cache = null;
}

export function fetchPageBanners(): Promise<PageBannerConfig[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch('/api/page-banners')
    .then((r) => (r.ok ? r.json() : []))
    .then((data: unknown) => {
      cache = Array.isArray(data) ? (data as PageBannerConfig[]) : [];
      return cache;
    })
    .catch(() => [] as PageBannerConfig[])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
