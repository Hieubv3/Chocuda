import React, { useEffect } from 'react';
import { ProjectFaqItem } from '../data/projectFaqData';
import { Property, NewsArticle, StoreProduct, UserStorefront, RecruitmentJob, CandidateProfile } from '../types';
import { ResidentServiceItem } from '../data/residentServicesData';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SeoJsonLdProps {
  type: 'faq' | 'property' | 'news' | 'organization' | 'product' | 'store' | 'service' | 'job' | 'candidate' | 'breadcrumb';
  faqItems?: ProjectFaqItem[];
  property?: Property;
  article?: NewsArticle;
  product?: StoreProduct;
  store?: UserStorefront;
  service?: ResidentServiceItem;
  job?: RecruitmentJob;
  candidate?: CandidateProfile;
  breadcrumbs?: BreadcrumbItem[];
}

export const SeoJsonLd: React.FC<SeoJsonLdProps> = ({
  type,
  faqItems,
  property,
  article,
  product,
  store,
  service,
  job,
  candidate,
  breadcrumbs
}) => {
  useEffect(() => {
    const scriptId = `jsonld-${type}-${Date.now()}`;
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';

    let jsonLdData: any = null;

    if (type === 'product' && product) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'image': product.images && product.images.length > 0 ? product.images : [store?.logoUrl || 'https://chocudan24h.com/logo.png'],
        'description': product.description || `${product.name} chất lượng cao, phục vụ cư dân Vinhomes.`,
        'sku': product.code || product.kiotVietId || product.id,
        'mpn': product.id,
        'brand': {
          '@type': 'Brand',
          'name': store?.storeName || 'Chợ Cư Dân Vinhomes 24h'
        },
        'offers': {
          '@type': 'Offer',
          'url': window.location.href,
          'priceCurrency': 'VND',
          'price': product.price,
          'priceValidUntil': new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': product.isAvailable && product.stockQuantity > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          'seller': {
            '@type': 'Store',
            'name': store?.storeName || 'Gian Hàng Cư Dân Vinhomes',
            'telephone': store?.ownerPhone || '0868499929',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': store?.address || 'Khu đô thị Vinhomes',
              'addressCountry': 'VN'
            }
          }
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': store?.rating || 4.9,
          'reviewCount': store?.reviewCount || 35,
          'bestRating': '5',
          'worstRating': '1'
        }
      };
    } else if (type === 'store' && store) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        'name': store.storeName,
        'image': store.bannerUrl || store.logoUrl,
        'logo': store.logoUrl,
        'telephone': store.ownerPhone,
        'url': window.location.href,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': store.address,
          'addressLocality': store.subdivision || store.project,
          'addressCountry': 'VN'
        },
        'priceRange': '$$',
        'openingHours': store.operatingHours || 'Mo-Su 07:30-21:30',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': store.rating || 5.0,
          'reviewCount': store.reviewCount || 40
        }
      };
    } else if (type === 'service' && service) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': service.title,
        'provider': {
          '@type': 'LocalBusiness',
          'name': service.providerName,
          'telephone': service.providerPhone,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': service.address,
            'addressLocality': service.project,
            'addressCountry': 'VN'
          }
        },
        'description': service.description,
        'serviceType': service.subCategory || service.categoryId,
        'areaServed': {
          '@type': 'AdministrativeArea',
          'name': service.project
        },
        'offers': {
          '@type': 'Offer',
          'price': service.priceDisplay || 'Thỏa thuận',
          'priceCurrency': 'VND'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': service.rating || 5.0,
          'reviewCount': service.reviewCount || 10
        }
      };
    } else if (type === 'job' && job) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        'title': job.title,
        'description': `${job.description}\n\nYêu cầu: ${job.requirements?.join(', ')}\nQuyền lợi: ${job.benefits?.join(', ')}`,
        'datePosted': job.postedAt || new Date().toISOString().split('T')[0],
        'employmentType': job.jobType === 'full_time' ? 'FULL_TIME' : job.jobType === 'part_time' ? 'PART_TIME' : 'OTHER',
        'hiringOrganization': {
          '@type': 'Organization',
          'name': job.companyName,
          'sameAs': 'https://chocudan24h.com'
        },
        'jobLocation': {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': job.location,
            'addressLocality': job.project,
            'addressCountry': 'VN'
          }
        },
        'baseSalary': {
          '@type': 'MonetaryAmount',
          'currency': 'VND',
          'value': {
            '@type': 'QuantitativeValue',
            'value': job.salaryDisplay || 'Thỏa thuận'
          }
        }
      };
    } else if (type === 'candidate' && candidate) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'mainEntity': {
          '@type': 'Person',
          'name': candidate.fullName,
          'image': candidate.avatarUrl,
          'jobTitle': candidate.targetJobTitle,
          'description': candidate.introduction || `Hồ sơ ứng viên ${candidate.fullName} vị trí ${candidate.targetJobTitle} tại ${candidate.projectName || candidate.currentProject}`,
          'knowsAbout': candidate.skills,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': candidate.currentAddress || candidate.projectName || candidate.currentProject,
            'addressCountry': 'VN'
          }
        }
      };
    } else if (type === 'breadcrumb' && breadcrumbs && breadcrumbs.length > 0) {
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((bc, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': bc.name,
          'item': bc.url.startsWith('http') ? bc.url : `https://chocudan24h.com${bc.url}`
        }))
      };
    } else if (type === 'faq' && faqItems && faqItems.length > 0) {
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
  }, [type, faqItems, property, article, product, store, service, job, candidate, breadcrumbs]);

  return null;
};
