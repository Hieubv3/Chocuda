import React, { useState, useEffect } from 'react';
import { Home, Building2, PlusCircle, ShoppingBag, User as UserIcon } from 'lucide-react';
import { Header } from './components/Header';
import { RealTimeMarketTicker } from './components/RealTimeMarketTicker';
import { StraightLineAiChatbot } from './components/StraightLineAiChatbot';
import { Footer } from './components/Footer';
import { ZaloWidget } from './components/ZaloWidget';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewsPage } from './pages/NewsPage';
import { PostPropertyPage } from './pages/PostPropertyPage';
import { HieuBuiProfilePage } from './pages/HieuBuiProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ResidentServicesPage } from './components/ResidentServicesPage';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { CompareModal } from './components/CompareModal';
import { AuthModal } from './components/AuthModal';
import { AiWriterModal } from './components/AiWriterModal';
import { OmnichannelBulkMarketingModal } from './components/OmnichannelBulkMarketingModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { AdBannerWidget } from './components/AdBannerWidget';
import { PopularVinhomesLinksSection } from './components/PopularVinhomesLinksSection';
import { Property, Project, NewsArticle, LeadContact, User, Language, ProjectCategory, PropertyCategory, HeightCategory, UpTinPricingConfig } from './types';
import { INITIAL_PROPERTIES, INITIAL_PROJECTS, INITIAL_NEWS, INITIAL_ADS } from './data/initialData';
import { safeLocalStorageGet, safeLocalStorageSet } from './lib/imageUtils';

export const App: React.FC = () => {
  // Theme & Language
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('vi');
// Tự động điều hướng và chặn truy cập Admin sai tên miền
  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    const isQuantriDomain = host === 'quantri.chocudan24h.com';

    if (isQuantriDomain) {
      if (!hash.includes('admin')) {
        window.location.hash = '#admin';
      }
    } else {
      const isTryingToAccessAdmin = 
        pathname.includes('admin') || 
        pathname.includes('quantri') || 
        hash.includes('admin');

      if (isTryingToAccessAdmin) {
        window.location.hash = '';
        window.location.replace('/');
      }
    }
  }, []);
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectCategory>('ocean-park-2');

  // User Auth - Restore session from local storage if existing
  const [user, setUser] = useState<User | null>(() => {
    return safeLocalStorageGet<User | null>('hb_user', null);
  });

  // Up-Tin & VietQR Pricing Config State
  const [pricingConfig, setPricingConfig] = useState<UpTinPricingConfig>({
    singlePushPrice: 20000,
    autoPush5Price: 90000,
    vipSilverPriceDay: 50000,
    vipGoldPriceDay: 100000,
    vipDiamondPriceDay: 200000,
    paymentEnabled: true,
    donateModeEnabled: false,
    donateMessage: 'Hệ thống hỗ trợ Đăng tin & Up-tin BĐS MIỄN PHÍ. Quý khách có thể Donate tùy tâm ủng hộ Admin duy trì máy chủ qua VietQR bên dưới.',
    bankName: 'MSB (Ngân hàng Hàng Hải Việt Nam)',
    accountNumber: '3028031988',
    accountHolder: 'BUI VAN HIEU'
  });

  // App Data with LocalStorage Persistence Fallback
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = safeLocalStorageGet<Property[]>('hb_properties', INITIAL_PROPERTIES);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_PROPERTIES;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = safeLocalStorageGet<Project[]>('hb_projects', INITIAL_PROJECTS);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_PROJECTS;
  });
  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = safeLocalStorageGet<NewsArticle[]>('hb_news', INITIAL_NEWS);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_NEWS;
  });
  const [contacts, setContacts] = useState<LeadContact[]>([]);

  // Modals
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aiWriterModalOpen, setAiWriterModalOpen] = useState(false);
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);

  // Favorites & Compare IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    return safeLocalStorageGet<string[]>('hb_saved_properties', []);
  });
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch initial data from server APIs & update localStorage with double-safety merge
  const refreshServerData = () => {
    fetch('/api/properties?status=all')
      .then(res => res.json())
      .then((data: Property[]) => {
        if (Array.isArray(data)) {
          const localSaved = safeLocalStorageGet<Property[]>('hb_properties', []);
          
          // Merge server properties + local properties to ensure user additions are NEVER lost
          const mergedMap = new Map<string, Property>();
          
          // 1. Add server properties
          data.forEach(p => mergedMap.set(p.id, p));
          
          // 2. Add local properties if not on server yet & sync to server
          localSaved.forEach(lp => {
            if (!mergedMap.has(lp.id)) {
              mergedMap.set(lp.id, lp);
              // Sync missing local property back to server
              fetch(`/api/properties/${lp.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lp)
              }).catch(() => {});
            }
          });

          const finalProps = Array.from(mergedMap.values());
          setProperties(finalProps);
          safeLocalStorageSet('hb_properties', finalProps);
        }
      })
      .catch(err => console.warn('Using initial properties fallback:', err));

    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          safeLocalStorageSet('hb_projects', data);
        }
      })
      .catch(err => console.warn('Using initial projects fallback:', err));

    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
          safeLocalStorageSet('hb_news', data);
        }
      })
      .catch(err => console.warn('Using initial news fallback:', err));

    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setContacts(data); })
      .catch(err => console.warn('Using initial contacts fallback:', err));


    fetch('/api/admin/pricing')
      .then(res => res.json())
      .then(data => { if (data && data.singlePushPrice) setPricingConfig(data); })
      .catch(() => {});
  };

  useEffect(() => {
    refreshServerData();

    // Check for Google OAuth callback in URL hash or pathname
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const pathname = window.location.pathname;

      if (
        pathname === '/auth/callback' ||
        hash.includes('id_token=') ||
        hash.includes('access_token=') ||
        search.includes('code=')
      ) {
        let email = '';
        let name = '';
        let picture = '';
        let googleId = '';

        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const idToken = params.get('id_token');

        if (idToken) {
          try {
            const payloadBase64 = idToken.split('.')[1];
            if (payloadBase64) {
              const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const parsed = JSON.parse(jsonPayload);
              email = parsed.email || '';
              name = parsed.name || '';
              picture = parsed.picture || '';
              googleId = parsed.sub || '';
            }
          } catch (e) {
            console.error('Error parsing ID token:', e);
          }
        }

        if (!email) {
          const accessToken = params.get('access_token');
          if (accessToken) {
            try {
              // Try Google userinfo
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (userInfoRes.ok) {
                const userInfo = await userInfoRes.json();
                email = userInfo.email || '';
                name = userInfo.name || '';
                picture = userInfo.picture || '';
                googleId = userInfo.sub || '';
              }
            } catch (e) {
              console.error('Error fetching Google userinfo:', e);
            }

            // Try Facebook userinfo if Google failed
            if (!email) {
              try {
                const fbRes = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
                if (fbRes.ok) {
                  const fbUser = await fbRes.json();
                  email = fbUser.email || `fb_${fbUser.id}@chocudan24h.com`;
                  name = fbUser.name || 'Thành viên Facebook';
                  picture = fbUser.picture?.data?.url || '';
                  googleId = fbUser.id || '';

                  // Call Facebook auth endpoint
                  const res = await fetch('/api/auth/facebook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      name,
                      avatar: picture,
                      facebookId: fbUser.id
                    })
                  });
                  const data = await res.json();
                  if (data && data.user) {
                    setUser(data.user);
                    localStorage.setItem('hb_user', JSON.stringify(data.user));

                    if (window.opener && window.opener !== window) {
                      window.opener.postMessage({ type: 'FACEBOOK_OAUTH_SUCCESS', user: data.user }, '*');
                      window.close();
                      return;
                    }
                  }
                }
              } catch (e) {
                console.error('Error fetching Facebook userinfo:', e);
              }
            }
          }
        }

        if (email) {
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                name: name || email.split('@')[0],
                avatar: picture,
                googleId
              })
            });
            const data = await res.json();
            if (data && data.user) {
              setUser(data.user);
              localStorage.setItem('hb_user', JSON.stringify(data.user));

              if (window.opener && window.opener !== window) {
                window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', user: data.user }, '*');
                window.close();
                return;
              }
            }
          } catch (e) {
            console.error('Error authenticating Google user on server:', e);
          }
        }

        window.history.replaceState({}, document.title, '/');
        setCurrentTab('home');
      }
    };

    handleOAuthCallback();

    const handleHashAndSearch = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (
        hash === '#privacy' ||
        hash === '#privacy-policy' ||
        hash === '#chinh-sach-bao-mat text-amber-500' ||
        hash === '#chinh-sach-bao-mat' ||
        pathname.endsWith('/privacy') ||
        pathname.endsWith('/privacy-policy') ||
        pathname.endsWith('/chinh-sach-bao-mat') ||
        search.includes('page=privacy') ||
        search.includes('privacy=1')
      ) {
        setCurrentTab('privacy');
        return;
      }

      if (
        hash === '#terms' ||
        hash === '#terms-of-service' ||
        hash === '#dieu-khoan' ||
        hash === '#dieu-khoan-su-dung' ||
        hash === '#dieu-khoan-dich-vu' ||
        pathname.endsWith('/terms') ||
        pathname.endsWith('/dieu-khoan') ||
        pathname.endsWith('/dieu-khoan-su-dung') ||
        search.includes('page=terms') ||
        search.includes('terms=1')
      ) {
        setCurrentTab('terms');
        return;
      }

      if (
        hash === '#quantri' ||
        hash === '#admin' ||
        hash === '#admin-secret' ||
        hash === '#quantri24h' ||
        pathname.endsWith('/admin') ||
        pathname.endsWith('/quantri') ||
        pathname.endsWith('/admin-login') ||
        search.includes('admin=1') ||
        search.includes('admin=true') ||
        search.includes('mode=admin') ||
        search.includes('quantri=1') ||
        search.includes('page=admin')
      ) {
        if (user?.role === 'admin') {
          setCurrentTab('admin');
        } else {
          setCurrentTab('admin_login');
        }
      }
    };

    handleHashAndSearch();

    const handlePopupMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS' && event.data.user) {
        setUser(event.data.user);
        localStorage.setItem('hb_user', JSON.stringify(event.data.user));
      }
    };

    window.addEventListener('popstate', handleHashAndSearch);
    window.addEventListener('hashchange', handleHashAndSearch);
    window.addEventListener('message', handlePopupMessage);

    return () => {
      window.removeEventListener('popstate', handleHashAndSearch);
      window.removeEventListener('hashchange', handleHashAndSearch);
      window.removeEventListener('message', handlePopupMessage);
    };
  }, [user]);

  // Save favorites to local storage
  const handleToggleSave = (property: Property) => {
    setSavedIds(prev => {
      const next = prev.includes(property.id)
        ? prev.filter(id => id !== property.id)
        : [...prev, property.id];
      safeLocalStorageSet('hb_saved_properties', next);
      return next;
    });
  };

  // Compare toggle
  const handleToggleCompare = (property: Property) => {
    setCompareIds(prev => {
      if (prev.includes(property.id)) {
        return prev.filter(id => id !== property.id);
      }
      if (prev.length >= 3) {
        alert('Chỉ có thể so sánh tối đa 3 bất động sản cùng lúc.');
        return prev;
      }
      return [...prev, property.id];
    });
  };

  // Property Admin approval handler
  const handleApproveProperty = async (id: string) => {
    setProperties(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, approved: true, status: 'approved' } : p);
      safeLocalStorageSet('hb_properties', updated);
      return updated;
    });
    try {
      await fetch(`/api/properties/${id}/approve`, { method: 'PUT' });
    } catch (e) {
      console.warn('Approved property locally:', id);
    }
  };

  // Property Update handler
  const handleUpdateProperty = async (updatedProperty: Property) => {
    setProperties(prev => {
      const updated = prev.map(p => p.id === updatedProperty.id ? updatedProperty : p);
      safeLocalStorageSet('hb_properties', updated);
      return updated;
    });
    try {
      await fetch(`/api/properties/${updatedProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProperty)
      });
    } catch (e) {
      console.warn('Updated property locally:', updatedProperty.id);
    }
  };

  // Project Update & Add handlers
  const handleUpdateProject = async (updatedProject: Project) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === updatedProject.id);
      const updated = exists ? prev.map(p => p.id === updatedProject.id ? updatedProject : p) : [updatedProject, ...prev];
      safeLocalStorageSet('hb_projects', updated);
      return updated;
    });
    try {
      const res = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
          safeLocalStorageSet('hb_projects', data.projects);
        }
      }
    } catch (e) {
      console.warn('Updated project locally:', updatedProject.id);
    }
  };

  const handleAddProject = async (newProject: Project) => {
    setProjects(prev => {
      const updated = [newProject, ...prev];
      safeLocalStorageSet('hb_projects', updated);
      return updated;
    });
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
          safeLocalStorageSet('hb_projects', data.projects);
        }
      }
    } catch (e) {
      console.warn('Added project locally:', newProject.id);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      safeLocalStorageSet('hb_projects', updated);
      return updated;
    });
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Deleted project locally:', id);
    }
  };

  // News Update handler
  const handleUpdateNews = async (updatedNews: NewsArticle) => {
    setNews(prev => {
      const updated = prev.map(n => n.id === updatedNews.id ? updatedNews : n);
      safeLocalStorageSet('hb_news', updated);
      return updated;
    });
    try {
      await fetch(`/api/news/${updatedNews.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNews)
      });
    } catch (e) {
      console.warn('Updated news article locally:', updatedNews.id);
    }
  };

  // News Add handler
  const handleAddNews = async (newArticle: NewsArticle) => {
    setNews(prev => {
      const updated = [newArticle, ...prev];
      safeLocalStorageSet('hb_news', updated);
      return updated;
    });
    try {
      await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      });
    } catch (e) {
      console.warn('Added news article locally');
    }
  };

  // News Delete handler
  const handleDeleteNews = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    setNews(prev => {
      const updated = prev.filter(n => n.id !== id);
      safeLocalStorageSet('hb_news', updated);
      return updated;
    });
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Deleted news article locally:', id);
    }
  };

  // Property Delete handler
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) return;
    setProperties(prev => {
      const updated = prev.filter(p => p.id !== id);
      safeLocalStorageSet('hb_properties', updated);
      return updated;
    });
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Deleted property locally:', id);
    }
  };


  // Save Pricing Config
  const handleSavePricingConfig = async (newConfig: UpTinPricingConfig) => {
    setPricingConfig(newConfig);
    try {
      await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {
      console.warn('Saved local pricing config');
    }
  };

  const [propertiesHeightCategory, setPropertiesHeightCategory] = useState<HeightCategory>('all');
  const [propertiesCategory, setPropertiesCategory] = useState<PropertyCategory | 'all'>('all');

  const handleNavigateWithFilter = (type: 'sale' | 'rent', heightCategory: HeightCategory = 'all', category: PropertyCategory | 'all' = 'all') => {
    setPropertiesHeightCategory(heightCategory);
    setPropertiesCategory(category);
    setCurrentTab(type);
  };
  const handleSeed1000Properties = async () => {
    try {
      const res = await fetch('/api/seed-1000', { method: 'POST' });
      const data = await res.json();
      if (data && data.properties) {
        setProperties(data.properties);
      }
    } catch (e) {
      // Fallback local 1000 items generator for extreme speed
      const new1000: Property[] = Array.from({ length: 1000 }, (_, i) => {
        const idNum = i + 1;
        const projectTypes: ProjectCategory[] = ['ocean-park-2', 'ocean-park-3', 'ha-long-xanh'];
        const pType = projectTypes[i % 3];
        const isRent = i % 2 === 0;
        const price = isRent ? Math.floor(Math.random() * 25) + 8 : (Math.floor(Math.random() * 200) + 30) / 10;
        const priceDisplay = isRent ? `${price} Triệu/tháng` : `${price.toFixed(1)} Tỷ`;

        return {
          id: `seed-1000-prop-${idNum}`,
          title: `${isRent ? 'Cho Thuê' : 'Bán'} Căn Căn Hộ/Biệt Thự Shophouse Vị Trí VIP #${idNum}`,
          type: isRent ? 'rent' : 'sale',
          project: pType,
          category: i % 4 === 0 ? 'biet-thu-don-lap' : i % 3 === 0 ? 'shophouse' : '2pn',
          price: price * (isRent ? 1000000 : 1000000000),
          priceDisplay: priceDisplay,
          area: Math.floor(Math.random() * 180) + 45,
          bedrooms: (i % 3) + 1,
          bathrooms: (i % 2) + 1,
          direction: 'Đông Nam',
          furniture: 'full',
          legal: 'so-do',
          address: `Phân khu Chà Là / San Hô #${idNum}, Vinhomes`,
          description: `Bất động sản vị trí đắc địa tại ${pType.toUpperCase()}, phân khu VIP.`,
          images: [
            `https://images.unsplash.com/photo-${1545324418 + (i % 10)}?auto=format&fit=crop&w=800&q=80`
          ],
          sellerName: `Chủ Nhà/Sale #${(i % 50) + 1}`,
          sellerPhone: `0868.499.${100 + (i % 800)}`,
          sellerRole: i % 2 === 0 ? 'owner' : 'sale',
          status: 'approved',
          approved: true,
          vipLevel: i < 20 ? 'diamond' : i < 60 ? 'gold' : 'normal',
          createdAt: 'Hôm nay'
        };
      });
      setProperties(new1000);
    }
  };

  // Add news generated by AI Writer
  const handlePublishNewsFromAi = (newsData: Partial<NewsArticle>) => {
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      title: newsData.title || 'Tin tức mới',
      summary: newsData.summary || '',
      content: newsData.content || '',
      category: newsData.category || 'vinhomes',
      author: newsData.author || 'Gemini AI',
      publishedAt: 'Hôm nay',
      source: 'ai',
      image: newsData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      views: 1,
      status: 'published'
    };

    setNews(prev => [newArticle, ...prev]);
    setAiWriterModalOpen(false);
    setCurrentTab('news');
  };

  // Render Page Body
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'home':
      return (
        <HomePage 
          language={language} 
          projects={projects} 
          properties={properties.filter(p => p.approved || p.status === 'approved')} 
          news={news.filter(n => n.status !== 'draft')} 
          setCurrentTab={setCurrentTab} 
          onSelectProperty={setSelectedPropertyModal} 
          savedIds={savedIds} 
          onToggleSave={handleToggleSave} 
          compareIds={compareIds} 
          onToggleCompare={handleToggleCompare} 
          onSelectProject={(projId) => { setSelectedProjectId(projId); }} 
        />
      );
        case 'create-cv':
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Tạo Hồ Sơ / CV Tìm Việc</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Điền thông tin bên dưới để tạo CV chuyên nghiệp ứng tuyển việc làm nội khu.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Đã lưu và đăng CV thành công! Các công ty/shop có thể tìm thấy hồ sơ của bạn.'); setCurrentTab('tuyendung'); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                  <input type="text" required placeholder="Ví dụ: Nguyễn Văn A" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vị trí muốn ứng tuyển / Nghề nghiệp</label>
                  <input type="text" required placeholder="Ví dụ: Thợ điện nước, Nhân viên bán hàng..." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại / Zalo liên hệ</label>
                  <input type="tel" required placeholder="0912345xxx" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mức lương mong muốn</label>
                  <input type="text" placeholder="Ví dụ: 8 - 10 triệu hoặc Thỏa thuận" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kinh nghiệm làm việc & Giới thiệu bản thân</label>
                <textarea rows={4} required placeholder="Mô tả ngắn gọn kinh nghiệm, kỹ năng và thời gian có thể bắt đầu làm việc..." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setCurrentTab('tuyendung')} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm">Hủy</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow">Lưu & Đăng CV</button>
              </div>
            </form>
          </div>
        </div>
      );
 case 'tuyendung': {
      const [jobSubTab, setJobSubTab] = useState<'vieclam' | 'timviec'>('vieclam');
      const [unlockedCandidates, setUnlockedCandidates] = useState<number[]>([]);

      const handleUnlockCandidate = (candidateId: number, fee: number) => {
        if (!user) {
          setAuthModalOpen(true);
          return;
        }
        const confirmPay = window.confirm(`Xem chi tiết liên hệ và tải CV ứng viên này sẽ tốn ${fee.toLocaleString('vi-VN')} đ. Bạn có muốn mở khóa ngay không?`);
        if (confirmPay) {
          setUnlockedCandidates(prev => [...prev, candidateId]);
          alert('Mở khóa thành công! Số điện thoại và file CV của ứng viên đã hiển thị.');
        }
      };

      return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Cổng Việc Làm & Nhân Sự Nội Khu</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Kết nối việc làm cho cư dân, thợ kỹ thuật và các chủ shop, công ty.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { if(!user) { setAuthModalOpen(true); } else { setCurrentTab('post'); } }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow transition"
              >
                + Đăng Tin Tuyển Dụng
              </button>
              <button 
                onClick={() => { if(!user) { setAuthModalOpen(true); } else { setCurrentTab('create-cv'); } }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow transition"
              >
                📄 Tạo Hồ Sơ / Đăng CV
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button 
              onClick={() => setJobSubTab('vieclam')}
              className={`pb-3 text-base font-extrabold transition border-b-2 ${jobSubTab === 'vieclam' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              💼 Việc Làm Đang Tuyển
            </button>
            <button 
              onClick={() => setJobSubTab('timviec')}
              className={`pb-3 text-base font-extrabold transition border-b-2 ${jobSubTab === 'timviec' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              👥 Hồ Sơ Ứng Viên (Nhà Tuyển Dụng Xem - Mất Phí)
            </button>
          </div>

          {jobSubTab === 'vieclam' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.filter(p => p.category === 'tuyendung' || p.type === 'tuyendung').length > 0 ? (
                properties.filter(p => p.category === 'tuyendung' || p.type === 'tuyendung').map(job => (
                  <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg mb-2 uppercase">Việc làm nội khu</span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 line-clamp-2">{job.title}</h3>
                      <p className="text-emerald-600 font-extrabold text-sm mb-3">{job.priceDisplay || (job.price ? `${job.price} đ` : 'Thỏa thuận')}</p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-3 mb-4">{job.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">LH: {job.sellerPhone || 'Cư dân'}</span>
                      <a href={`tel:${job.sellerPhone}`} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg">Ứng tuyển / Gọi</a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 text-sm font-medium">Chưa có tin tuyển dụng nào.</p>
                </div>
              )}
            </div>
          )}

          {jobSubTab === 'timviec' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 text-xs text-blue-800 dark:text-blue-300 flex justify-between items-center">
                <span>🔒 Khu vực dữ liệu ứng viên. Nhà tuyển dụng thanh toán phí để mở khóa số điện thoại và tải CV gốc.</span>
                <span className="font-bold">Phí xem: 50.000đ</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center text-lg">NV</div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">Nguyễn Văn A</h4>
                        <p className="text-xs text-slate-500">Thợ Điện Nước / Kỹ Thuật Tổng Hợp</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">Kinh nghiệm 5 năm thi công hệ thống điện nước căn hộ và biệt thự nội khu.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {unlockedCandidates.includes(1) ? (
                      <div className="space-y-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs">
                        <p className="text-emerald-700 font-bold">✅ Đã mở khóa liên hệ:</p>
                        <p className="text-slate-900 font-extrabold">SĐT/Zalo: 0912.345.xxx</p>
                        <button onClick={() => alert('Đang tải xuống file CV PDF gốc của ứng viên...')} className="w-full mt-1 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-center block">Tải Xuống CV Gốc</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-amber-600 font-bold">🔒 Ẩn số ĐT</span>
                        <button onClick={() => handleUnlockCandidate(1, 50000)} className="px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
                          Mở khóa xem (50.000đ)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
      case 'properties':
      case 'sale':
        return (
          <PropertiesPage
            properties={properties.filter(p => p.approved || p.status === 'approved')}
            language={language}
            initialType="sale"
            initialProject={selectedProjectId}
            initialHeightCategory={propertiesHeightCategory}
            initialCategory={propertiesCategory}
            onSelectProperty={setSelectedPropertyModal}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        );

      case 'rent':
        return (
          <PropertiesPage
            properties={properties.filter(p => p.approved || p.status === 'approved')}
            language={language}
            initialType="rent"
            initialProject={selectedProjectId}
            initialHeightCategory={propertiesHeightCategory}
            initialCategory={propertiesCategory}
            onSelectProperty={setSelectedPropertyModal}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        );

      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            language={language}
            selectedProjectId={selectedProjectId}
            onFilterPropertiesByProject={(projId) => {
              setSelectedProjectId(projId);
              setCurrentTab('sale');
            }}
            properties={properties.filter(p => p.approved || p.status === 'approved')}
            onSelectProperty={setSelectedPropertyModal}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        );

      case 'services':
      case 'resident_services':
      case 'resident-services':
        return (
          <ResidentServicesPage
            currentUser={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        );

      case 'news':
        return <NewsPage news={news.filter(n => n.status !== 'draft')} language={language} currentUser={user} />;

      case 'post':
        return (
          <PostPropertyPage
            language={language}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            existingProperties={properties}
            onPropertySubmitted={() => {
              refreshServerData();
              if (user) {
                setCurrentTab('user_dashboard');
              }
            }}
          />
        );

      case 'profile':
        return <HieuBuiProfilePage language={language} />;

      case 'user_dashboard':
        return user ? (
          <UserDashboardPage
            user={user}
            properties={properties}
            language={language}
            pricingConfig={pricingConfig}
            onPostNewProperty={() => setCurrentTab('post')}
            onSelectProperty={setSelectedPropertyModal}
            onDeleteProperty={handleDeleteProperty}
            onRefreshData={refreshServerData}
            onLogout={() => {
              setUser(null);
              setAuthModalOpen(true);
            }}
          />
        ) : (
          <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-md">
              HB
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">BẠN CHƯA ĐĂNG NHẬP</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vui lòng đăng nhập tài khoản Chủ nhà, Sale hoặc Khách hàng để quản lý tin đăng & sử dụng tính năng Up Tin.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
            >
              🔑 ĐĂNG NHẬP / ĐĂNG KÝ NGAY
            </button>
          </div>
        );

      case 'privacy':
      case 'privacy-policy':
      case 'chinh-sach-bao-mat':
        return (
          <PrivacyPolicyPage
            language={language}
            onBackToHome={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'terms':
      case 'terms-of-service':
      case 'dieu-khoan':
      case 'dieu-khoan-su-dung':
      case 'dieu-khoan-dich-vu':
        return (
          <TermsOfServicePage
            language={language}
            onBackToHome={() => {
              setCurrentTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'admin_login':
        return (
          <AdminLoginPage
            language={language}
            onLoginSuccess={(u) => {
              setUser(u);
              setCurrentTab(u.role === 'admin' ? 'admin' : 'user_dashboard');
            }}
            onBackToHome={() => setCurrentTab('home')}
          />
        );

      case 'admin':
        return (
          <AdminDashboardPage
            properties={properties}
            projects={projects}
            news={news}
            contacts={contacts}
            pricingConfig={pricingConfig}
            onSavePricingConfig={handleSavePricingConfig}
            onApproveProperty={handleApproveProperty}
            onUpdateProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
            onUpdateProject={handleUpdateProject}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onUpdateNews={handleUpdateNews}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeleteNews}
            onOpenAiWriter={() => setAiWriterModalOpen(true)}
            onRefreshData={refreshServerData}
            onSeed1000Properties={handleSeed1000Properties}
          />
        );

      default:
        return (
          <HomePage
            language={language}
            projects={projects}
            properties={properties.filter(p => p.approved || p.status === 'approved')}
            news={news}
            setCurrentTab={setCurrentTab}
            onSelectProperty={setSelectedPropertyModal}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            onSelectProject={(projId) => {
              setSelectedProjectId(projId);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 pb-16 md:pb-0">
      
      {/* Top Banner (If active) */}
      <AdBannerWidget ads={INITIAL_ADS} position="header_top" />

      {/* Navigation Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        darkMode={theme === 'dark'}
        setDarkMode={(val) => setTheme(val ? 'dark' : 'light')}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('hb_user');
          setCurrentTab('home');
        }}
        savedCount={savedIds.length}
        compareCount={compareIds.length}
        onOpenSaved={() => setCurrentTab('sale')}
        onOpenCompare={() => setCompareModalOpen(true)}
        onOpenAiWriter={() => setAiWriterModalOpen(true)}
        onOpenMarketingModal={() => setMarketingModalOpen(true)}
        onOpenAndroidModal={() => setAndroidModalOpen(true)}
        onNavigateWithFilter={handleNavigateWithFilter}
      />

      {/* Main Page Render */}
      <main className="flex-1 w-full overflow-x-hidden">
        {renderCurrentPage()}
      </main>

      {/* Popular Links Section at Bottom of Site (When not on Home page which already includes it) */}
      {currentTab !== 'home' && currentTab !== 'admin' && currentTab !== 'admin_login' && (
        <PopularVinhomesLinksSection
          setCurrentTab={setCurrentTab}
          onSelectProject={(projId) => setSelectedProjectId(projId)}
        />
      )}

      {/* Footer */}
      <Footer
        language={language}
        setCurrentTab={setCurrentTab}
        onOpenSecretAdmin={() => setCurrentTab('admin_login')}
        onOpenAndroidModal={() => setAndroidModalOpen(true)}
      />

      {/* Zalo Floating Contacts Widget */}
      <ZaloWidget />

      {/* Property Details Modal */}
      {selectedPropertyModal && (
        <PropertyDetailModal
          property={selectedPropertyModal}
          language={language}
          onClose={() => setSelectedPropertyModal(null)}
          onOpenMortgageWithPrice={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 1200, behavior: 'smooth' });
          }}
        />
      )}

      {/* Compare Side-By-Side Modal */}
      {compareModalOpen && (
        <CompareModal
          properties={properties.filter(p => compareIds.includes(p.id))}
          language={language}
          onClose={() => setCompareModalOpen(false)}
          onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
          onSelectProperty={(p) => {
            setCompareModalOpen(false);
            setSelectedPropertyModal(p);
          }}
        />
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(u) => {
            setUser(u);
            try {
              localStorage.setItem('hb_user', JSON.stringify(u));
            } catch (e) {}
            setAuthModalOpen(false);
            if (u.role === 'admin') {
              setCurrentTab('admin');
            } else {
              setCurrentTab('user_dashboard');
            }
          }}
        />
      )}

      {/* AI Straight Line Sales Chatbot */}
      <StraightLineAiChatbot
        properties={properties}
        projects={projects}
        news={news}
        onOpenConsultation={() => setAuthModalOpen(true)}
        onOpenUpTin={() => setCurrentTab('up_tin')}
      />

      {/* Gemini AI Writer Studio Modal */}
      {aiWriterModalOpen && (
        <AiWriterModal
          onClose={() => setAiWriterModalOpen(false)}
          onPublishNews={handlePublishNewsFromAi}
        />
      )}

      {/* Omnichannel Bulk Marketing Modal */}
      <OmnichannelBulkMarketingModal
        isOpen={marketingModalOpen}
        onClose={() => setMarketingModalOpen(false)}
        properties={properties}
      />

      {/* Android APK Download Modal */}
      <AndroidApkModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar - Standard Chợ Tốt / Nhà Tốt App Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1.5 py-1 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Trang Chủ</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('properties');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'properties' || currentTab === 'sale' || currentTab === 'rent'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Bất Động Sản</span>
        </button>

        {/* Center Highlighted Post Button */}
        <button
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              setCurrentTab('post');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center -mt-4 group shrink-0"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900 group-active:scale-95 transition transform">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-black text-emerald-600 dark:text-emerald-400">Đăng Tin</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('resident_services');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'resident_services' || currentTab === 'services'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Chợ Cư Dân</span>
        </button>

        <button
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else if (user.role === 'admin') {
              setCurrentTab('admin');
            } else {
              setCurrentTab('user_dashboard');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'user_dashboard' || currentTab === 'admin'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Cá Nhân</span>
        </button>
      </div>

      {/* Global PC Floating Banners - Sticky Right Side Only as Requested */}
      <AdBannerWidget ads={INITIAL_ADS} position="float_right_pc" />
      <AdBannerWidget ads={INITIAL_ADS} position="popup_modal" />

    </div>
  );
};

export default App;
