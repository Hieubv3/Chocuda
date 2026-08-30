import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Chợ Cư Dân 24h - Nền Tảng BĐS & Dịch Vụ Cư Dân Vinhomes',
  description = 'Kênh thông tin bất động sản, chuyển nhượng, cho thuê căn hộ, shophouse và dịch vụ cư dân Vinhomes Ocean Park 1, 2, 3, Hạ Long Xanh, Smart City.',
  image = '',
  url,
  type = 'website',
  keywords = 'bất động sản vinhomes, chợ cư dân, mua bán ocean park 2, shophouse chà là, việc làm cư dân, dịch vụ nội khu'
}) => {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title.includes('Chợ Cư Dân 24h') ? title : `${title} | Chợ Cư Dân 24h`;
    document.title = fullTitle;

    // 2. Helper to set or create meta tag
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set canonical link
    const currentUrl = url || window.location.href;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 4. Update standard meta tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);

    // 5. OpenGraph for Facebook & Zalo sharing
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Chợ Cư Dân 24h');
    setMeta('property', 'og:locale', 'vi_VN');

    // 6. Twitter card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

  }, [title, description, image, url, type, keywords]);

  return null;
};
