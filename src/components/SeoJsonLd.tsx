import React, { useEffect } from 'react';
import { ProjectFaqItem } from '../data/projectFaqData';
import { Property, NewsArticle } from '../types';

interface SeoJsonLdProps {
  type: 'faq' | 'property' | 'news' | 'organization';
  faqItems?: ProjectFaqItem[];
  property?: Property;
  article?: NewsArticle;
}

export const SeoJsonLd: React.FC<SeoJsonLdProps> = ({
  type,
  faqItems,
  property,
  article
}) => {
  useEffect(() => {
    const scriptId = `jsonld-${type}-${Date.now()}`;
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';

    let jsonLdData: any = null;

    if (type === 'faq' && faqItems && faqItems.length > 0) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqItems.map(item => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.answer
          }
        }))
      };
    } else if (type === 'property' && property) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        'name': property.title,
        'description': property.description,
        'url': `https://chocudan24h.com/properties/${property.id}`,
        'datePosted': property.createdAt,
        'offers': {
          '@type': 'Offer',
          'price': property.price,
          'priceCurrency': 'VND',
          'availability': 'https://schema.org/InStock',
          'validFrom': property.createdAt
        },
        'accommodationCategory': property.category,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': property.address,
          'addressRegion': property.project,
          'addressCountry': 'VN'
        }
      };
    } else if (type === 'news' && article) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'headline': article.title,
        'description': article.summary,
        'image': [article.image],
        'datePublished': article.publishedAt,
        'author': {
          '@type': 'Person',
          'name': article.author || 'Chợ Cư Dân 24h'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Chợ Cư Dân 24h - Nền Tảng Trao Đổi Thông Tin Chuyển Nhượng, Cho Thuê & Kết Nối Cư Dân Vinhomes',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://chocudan24h.com/logo.png'
          }
        }
      };
    } else if (type === 'organization') {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        'name': 'Chợ Cư Dân 24h',
        'url': 'https://chocudan24h.com',
        'logo': 'https://chocudan24h.com/logo.png',
        'telephone': '0868.499.929',
        'priceRange': '$$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Phân khu Chà Là, Vinhomes Ocean Park 2',
          'addressLocality': 'Hưng Yên / Hà Nội',
          'addressCountry': 'VN'
        },
        'sameAs': [
          'https://facebook.com/chocudan24h',
          'https://youtube.com/@chocudan24h',
          'https://tiktok.com/@chocudan24h'
        ]
      };
    }

    if (jsonLdData) {
      script.text = JSON.stringify(jsonLdData);
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [type, faqItems, property, article]);

  return null;
};
