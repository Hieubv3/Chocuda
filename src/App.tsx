import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, Building2, PlusCircle, ShoppingBag, User as UserIcon } from 'lucide-react';
import { Header } from './components/Header';
import { RealTimeMarketTicker } from './components/RealTimeMarketTicker';
import { StraightLineAiChatbot } from './components/StraightLineAiChatbot';
import { Footer } from './components/Footer';
import { ZaloWidget } from './components/ZaloWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SubdivisionDetailPage } from './pages/SubdivisionDetailPage';
import { AmenityDetailPage } from './pages/AmenityDetailPage';
import { NewsPage } from './pages/NewsPage';
import { NewsArticleDetailPage } from './pages/NewsArticleDetailPage';
import { PostPropertyPage } from './pages/PostPropertyPage';
import { HieuBuiProfilePage } from './pages/HieuBuiProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { ResidentServicesPage } from './components/ResidentServicesPage';
import { ResidentServiceDetailPage } from './pages/ResidentServiceDetailPage';
import { ResidentStoreDetailPage } from './pages/ResidentStoreDetailPage';
import { ResidentProductDetailPage } from './pages/ResidentProductDetailPage';
import { SitemapDirectoryPage } from './pages/SitemapDirectoryPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { CommunityGroupsPage } from './pages/CommunityGroupsPage';
import { MortgageCalculatorPage } from './pages/MortgageCalculatorPage';
import { RecruitmentCenterPage } from './components/RecruitmentCenterPage';
import { RecruitmentJobDetailPage } from './pages/RecruitmentJobDetailPage';
import { CandidateCvDetailPage } from './pages/CandidateCvDetailPage';
import { EmployerProfilePage } from './pages/EmployerProfilePage';
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
import { getProjectSlug } from './lib/slugs';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme & Language
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('vi');

  // Navigation compatibility state
  const [selectedProjectId, setSelectedProjectId] = useState<ProjectCategory>('ocean-park-2');

  // Check if current hostname is the dedicated admin portal
  const isAdminDomain = typeof window !== 'undefined' && (
    window.location.hostname === 'quantri.chocudan24h.com' ||
    window.location.hostname.startsWith('quantri.')
  );

  // User Auth - Restore session from local storage if existing
  const [user, setUser] = useState<User | null>(() => {
    const raw = safeLocalStorageGet<User | null>('hb_user', null);
    if (!raw) return null;
    return {
      ...raw,
      name: raw.name || (raw.email ? raw.email.split('@')[0] : 'Cư Dân Vinhomes'),
      email: raw.email || 'cudan@chocudan24h.com',
      role: raw.role || 'visitor',
      upTinCredits: typeof raw.upTinCredits === 'number' ? raw.upTinCredits : 20,
      tier: raw.tier || 'thuong',
      balance: raw.balance || 0
    };
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
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data);
        }
      })
      .catch(err => console.warn('Using initial contacts fallback:', err));

    fetch('/api/system/pricing-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.bankName) {
          setPricingConfig(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshServerData();
  }, []);

  // Listen for login events from OAuth popups or other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hb_user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.email) {
            setUser(parsed);
            setAuthModalOpen(false);
          }
        } catch (err) {}
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'GOOGLE_OAUTH_SUCCESS' && e.data.user) {
        setUser(e.data.user);
        safeLocalStorageSet('hb_user', e.data.user);
        setAuthModalOpen(false);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Strict Admin Redirection Rule:
  // On non-admin domains, strip #admin / #quantri hash and redirect to home
  useEffect(() => {
    if (!isAdminDomain) {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === '#admin' ||
        hash === '#quantri' ||
        hash === '#admin-secret' ||
        hash === '#quantri24h'
      ) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        navigate('/', { replace: true });
      }
    }
  }, [location, isAdminDomain, navigate]);

  // Handle tab switching helper for Header/Footer compatibility
  const handleTabSwitch = (tab: string) => {
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'properties':
      case 'bat-dong-san':
        navigate('/bat-dong-san');
        break;
      case 'sale':
      case 'mua-ban':
        navigate('/mua-ban');
        break;
      case 'rent':
      case 'cho-thue':
        navigate('/cho-thue');
        break;
      case 'projects':
      case 'du-an':
        navigate('/du-an');
        break;
      case 'services':
      case 'resident_services':
      case 'dich-vu-cu-dan':
        navigate('/dich-vu-cu-dan');
        break;
      case 'recruitment':
      case 'tuyen-dung':
        navigate('/tuyen-dung');
        break;
      case 'news':
      case 'tin-tuc':
        navigate('/tin-tuc');
        break;
      case 'post':
      case 'post-property':
      case 'dang-tin':
        navigate('/dang-tin');
        break;
      case 'profile':
      case 've-chung-toi':
        navigate('/ve-chung-toi');
        break;
      case 'mortgage':
      case 'tinh-lai-vay':
        navigate('/tinh-lai-vay');
        break;
      case 'community':
      case 'cong-dong':
        navigate('/cong-dong');
        break;
      case 'user_dashboard':
      case 'tai-khoan':
        navigate('/tai-khoan');
        break;
      case 'privacy':
        navigate('/chinh-sach-bao-mat');
        break;
      case 'terms':
        navigate('/dieu-khoan-su-dung');
        break;
      case 'admin':
      case 'admin_login':
        if (isAdminDomain) {
          navigate('/');
        } else {
          navigate('/', { replace: true });
        }
        break;
      default:
        navigate('/');
    }
  };

  // Determine active tab name from current pathname
  const getCurrentTabName = (): string => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/du-an')) return 'projects';
    if (path.startsWith('/mua-ban') || path.startsWith('/ban')) return 'sale';
    if (path.startsWith('/cho-thue') || path.startsWith('/thue')) return 'rent';
    if (path.startsWith('/bat-dong-san')) return 'properties';
    if (path.startsWith('/dich-vu-cu-dan')) return 'services';
    if (path.startsWith('/tuyen-dung')) return 'recruitment';
    if (path.startsWith('/tin-tuc')) return 'news';
    if (path.startsWith('/dang-tin')) return 'post-property';
    if (path.startsWith('/ve-chung-toi') || path.startsWith('/gioi-thieu')) return 'profile';
    if (path.startsWith('/cong-dong')) return 'community';
    if (path.startsWith('/tinh-lai-vay')) return 'mortgage';
    if (path.startsWith('/tai-khoan')) return 'user_dashboard';
    if (path.startsWith('/chinh-sach-bao-mat') || path.startsWith('/privacy')) return 'privacy';
    if (path.startsWith('/dieu-khoan-su-dung') || path.startsWith('/terms')) return 'terms';
    return 'home';
  };

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

  // Delete Property handler
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin đăng BĐS này?')) return;
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

  const handleSavePricingConfig = async (newConfig: UpTinPricingConfig) => {
    setPricingConfig(newConfig);
    try {
      await fetch('/api/system/pricing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {
      console.warn('Updated pricing config locally');
    }
  };

  const handlePublishNewsFromAi = (article: NewsArticle) => {
    handleAddNews(article);
    setAiWriterModalOpen(false);
  };

  const handleSeed1000Properties = () => {
    refreshServerData();
  };

  const handleNavigateWithFilter = (type: 'sale' | 'rent', heightCategory?: HeightCategory, category?: PropertyCategory | 'all') => {
    const query = new URLSearchParams();
    if (heightCategory && heightCategory !== 'all') query.set('height', heightCategory);
    if (category && category !== 'all') query.set('category', category);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    navigate(`/${type === 'sale' ? 'mua-ban' : 'cho-thue'}${queryString}`);
  };

  // ==================== SPECIAL ADMIN DOMAIN MODE ====================
  // If user visits on quantri.chocudan24h.com, render Admin Dashboard / Admin Login
  if (isAdminDomain) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans">
        <ScrollToTop />
        {user?.role === 'admin' ? (
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
        ) : (
          <AdminLoginPage
            language={language}
            onLoginSuccess={(u) => {
              setUser(u);
              safeLocalStorageSet('hb_user', u);
            }}
            onBackToHome={() => {
              window.location.href = 'https://chocudan24h.com';
            }}
          />
        )}
      </div>
    );
  }

  // ==================== STANDARD USER PORTAL WITH FULL ROUTER ====================
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 pb-16 md:pb-0">
      <ScrollToTop />

      {/* Top Banner (If active) */}
      <AdBannerWidget ads={INITIAL_ADS} position="header_top" />

      {/* Navigation Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        darkMode={theme === 'dark'}
        setDarkMode={(val) => setTheme(val ? 'dark' : 'light')}
        currentTab={getCurrentTabName()}
        setCurrentTab={handleTabSwitch}
        currentUser={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('hb_user');
          navigate('/');
        }}
        savedCount={savedIds.length}
        compareCount={compareIds.length}
        onOpenSaved={() => navigate('/mua-ban')}
        onOpenCompare={() => setCompareModalOpen(true)}
        onOpenAiWriter={() => setAiWriterModalOpen(true)}
        onOpenMarketingModal={() => setMarketingModalOpen(true)}
        onOpenAndroidModal={() => setAndroidModalOpen(true)}
        onNavigateWithFilter={handleNavigateWithFilter}
      />

      {/* Main Page Render via React Router */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          {/* OAuth Redirect / Popup Callback Route */}
          <Route
            path="/auth/callback"
            element={
              <AuthCallbackPage
                onLoginSuccess={(loggedInUser) => {
                  setUser(loggedInUser);
                  safeLocalStorageSet('hb_user', loggedInUser);
                  setAuthModalOpen(false);
                }}
              />
            }
          />

          {/* 1. Trang Chủ */}
          <Route
            path="/"
            element={
              <HomePage
                language={language}
                projects={projects}
                properties={properties.filter(p => p.approved || p.status === 'approved')}
                news={news}
                setCurrentTab={handleTabSwitch}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />

          {/* 2. Dự Án & Quỹ Căn */}
          <Route
            path="/du-an"
            element={
              <ProjectsPage
                projects={projects}
                properties={properties}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onFilterPropertiesByProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/du-an/:projectSlug"
            element={
              <ProjectDetailPage
                projects={projects}
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/du-an/:projectSlug/phan-khu/:subdivisionSlug"
            element={
              <SubdivisionDetailPage
                projects={projects}
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/phan-khu/:subdivisionSlug"
            element={
              <SubdivisionDetailPage
                projects={projects}
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/du-an/:projectSlug/tien-ich/:amenitySlug"
            element={
              <AmenityDetailPage
                projects={projects}
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/tien-ich/:amenitySlug"
            element={
              <AmenityDetailPage
                projects={projects}
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />

          {/* 3. Bất Động Sản (Mua Bán / Cho Thuê) */}
          <Route
            path="/bat-dong-san"
            element={
              <PropertiesPage
                properties={properties}
                projects={projects}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onOpenAuth={() => setAuthModalOpen(true)}
                currentUser={user}
              />
            }
          />
          <Route
            path="/mua-ban"
            element={
              <PropertiesPage
                initialType="sale"
                properties={properties}
                projects={projects}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onOpenAuth={() => setAuthModalOpen(true)}
                currentUser={user}
              />
            }
          />
          <Route
            path="/ban"
            element={
              <PropertiesPage
                initialType="sale"
                properties={properties}
                projects={projects}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onOpenAuth={() => setAuthModalOpen(true)}
                currentUser={user}
              />
            }
          />
          <Route
            path="/cho-thue"
            element={
              <PropertiesPage
                initialType="rent"
                properties={properties}
                projects={projects}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onOpenAuth={() => setAuthModalOpen(true)}
                currentUser={user}
              />
            }
          />
          <Route
            path="/thue"
            element={
              <PropertiesPage
                initialType="rent"
                properties={properties}
                projects={projects}
                language={language}
                onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onOpenAuth={() => setAuthModalOpen(true)}
                currentUser={user}
              />
            }
          />

          {/* 4. Chi Tiết Căn Hộ / BĐS - Hỗ Trợ Đầy Đủ Tất Cả Các Đường Dẫn Riêng Biệt */}
          <Route
            path="/bat-dong-san/:id"
            element={
              <PropertyDetailPage
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/ban/:id"
            element={
              <PropertyDetailPage
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/cho-thue/:id"
            element={
              <PropertyDetailPage
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/thue/:id"
            element={
              <PropertyDetailPage
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/:projectSlug/:id"
            element={
              <PropertyDetailPage
                properties={properties}
                language={language}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
              />
            }
          />

          {/* 5. Chuyên Mục Tin Tức & Cẩm Nang */}
          <Route
            path="/tin-tuc"
            element={
              <NewsPage
                news={news}
                language={language}
                onSelectArticle={(art) => navigate(`/tin-tuc/${art.category || 'chung'}/${art.id}`)}
              />
            }
          />
          <Route
            path="/tin-tuc/:categorySlug"
            element={
              <NewsPage
                news={news}
                language={language}
                onSelectArticle={(art) => navigate(`/tin-tuc/${art.category || 'chung'}/${art.id}`)}
              />
            }
          />
          <Route
            path="/tin-tuc/:categorySlug/:postSlug"
            element={
              <NewsArticleDetailPage
                news={news}
                language={language}
              />
            }
          />
          <Route
            path="/tin-tuc/bai-viet/:postSlug"
            element={
              <NewsArticleDetailPage
                news={news}
                language={language}
              />
            }
          />

          {/* 6. Dịch Vụ Cư Dân & Chi Tiết Dịch Vụ */}
          <Route
            path="/dich-vu-cu-dan"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/dich-vu-cu-dan/danh-muc/:categorySlug"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/dich-vu-cu-dan/danh-muc/:categorySlug/:subCategorySlug"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/dich-vu-cu-dan/du-an/:projectSlug"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/cho-cu-dan"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/gian-hang"
            element={
              <ResidentServicesPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/gian-hang/:storeSlug"
            element={
              <ResidentStoreDetailPage
                language={language}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/gian-hang/:storeSlug/san-pham/:productId/:productSlug"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/gian-hang/:storeSlug/san-pham/:productId"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/gian-hang/:storeSlug/:productId"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/san-pham/:productId/:productSlug"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/san-pham/:productId"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/cho-cu-dan/san-pham/:productId/:productSlug"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/cho-cu-dan/san-pham/:productId"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/hang-hoa/:productId/:productSlug"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/hang-hoa/:productId"
            element={
              <ResidentProductDetailPage
                language={language}
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/dich-vu-cu-dan/:serviceSlug"
            element={
              <ResidentServiceDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />

          {/* HTML Sitemap Directory Route */}
          <Route
            path="/sitemap"
            element={<SitemapDirectoryPage />}
          />
          <Route
            path="/so-do-website"
            element={<SitemapDirectoryPage />}
          />

          {/* 7. Group Cư Dân & Cộng Đồng */}
          <Route
            path="/cong-dong"
            element={<CommunityGroupsPage />}
          />
          <Route
            path="/cong-dong/:groupSlug"
            element={<CommunityGroupsPage />}
          />

          {/* 8. Việc Làm & Tuyển Dụng Cư Dân - ĐẦY ĐỦ CÁC ĐƯỜNG DẪN RIÊNG */}
          <Route
            path="/tuyen-dung"
            element={
              <RecruitmentCenterPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/viec-lam/:jobId/:slug"
            element={
              <RecruitmentJobDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/viec-lam/:jobId"
            element={
              <RecruitmentJobDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/ung-vien/:candidateId/:slug"
            element={
              <CandidateCvDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/ung-vien/:candidateId"
            element={
              <CandidateCvDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/cv/:candidateId"
            element={
              <CandidateCvDetailPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          {/* Hồ Sơ Nhà Tuyển Dụng Chuyên Nghiệp */}
          <Route
            path="/tuyen-dung/nha-tuyen-dung/:employerId/:slug"
            element={
              <EmployerProfilePage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/nha-tuyen-dung/:employerId"
            element={
              <EmployerProfilePage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/nha-tuyen-dung/:employerId/:slug"
            element={
              <EmployerProfilePage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/nha-tuyen-dung/:employerId"
            element={
              <EmployerProfilePage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/nganh-nghe/:industryId"
            element={
              <RecruitmentCenterPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/du-an/:projectSlug"
            element={
              <RecruitmentCenterPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/tuyen-dung/:tabName"
            element={
              <RecruitmentCenterPage
                currentUser={user}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />

          {/* 9. Đăng Tin BĐS */}
          <Route
            path="/dang-tin"
            element={
              user ? (
                <PostPropertyPage
                  language={language}
                  currentUser={user}
                  pricingConfig={pricingConfig}
                  onAddProperty={(prop) => {
                    setProperties(prev => [prop, ...prev]);
                    navigate('/tai-khoan');
                  }}
                  onCancel={() => navigate('/')}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-md">
                    HB
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">BẠN CHƯA ĐĂNG NHẬP</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vui lòng đăng nhập tài khoản Chủ nhà, Sale hoặc Khách hàng để đăng tin BĐS và dịch vụ cư dân.
                  </p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                  >
                    🔑 ĐĂNG NHẬP / ĐĂNG KÝ NGAY
                  </button>
                </div>
              )
            }
          />

          {/* 10. Tính Lãi Suất Vay */}
          <Route
            path="/tinh-lai-vay"
            element={<MortgageCalculatorPage />}
          />

          {/* 11. Giới Thiệu / Về Chúng Tôi */}
          <Route
            path="/ve-chung-toi"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/gioi-thieu"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/chuyen-gia"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/chuyen-gia/:expertSlug"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/bui-van-hieu"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />
          <Route
            path="/bui-trung-hieu"
            element={
              <HieuBuiProfilePage
                language={language}
                onSelectProject={(projId) => {
                  setSelectedProjectId(projId);
                  navigate(`/du-an/${getProjectSlug(projId)}`);
                }}
              />
            }
          />

          {/* 12. Quản Lý Tài Khoản Cá Nhân */}
          <Route
            path="/tai-khoan"
            element={
              user ? (
                <UserDashboardPage
                  user={user}
                  currentUser={user}
                  properties={properties}
                  language={language}
                  pricingConfig={pricingConfig}
                  onUpdateProperty={handleUpdateProperty}
                  onDeleteProperty={handleDeleteProperty}
                  onOpenPostProperty={() => navigate('/dang-tin')}
                  onPostNewProperty={() => navigate('/dang-tin')}
                  onSelectProperty={(prop) => navigate(`/${getProjectSlug(prop.project)}/${prop.id}`)}
                  onOpenAiWriter={() => setAiWriterModalOpen(true)}
                  onRefreshData={refreshServerData}
                  onLogout={() => {
                    setUser(null);
                    safeLocalStorageSet('hb_user', null);
                    navigate('/');
                  }}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-md">
                    HB
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">BẠN CHƯA ĐĂNG NHẬP</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vui lòng đăng nhập để quản lý tin đăng & số dư tài khoản của bạn.
                  </p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                  >
                    🔑 ĐĂNG NHẬP / ĐĂNG KÝ NGAY
                  </button>
                </div>
              )
            }
          />

          {/* 13. Chính Sách Bảo Mật & Điều Khoản */}
          <Route
            path="/chinh-sach-bao-mat"
            element={<PrivacyPolicyPage language={language} onBackToHome={() => navigate('/')} />}
          />
          <Route
            path="/privacy"
            element={<PrivacyPolicyPage language={language} onBackToHome={() => navigate('/')} />}
          />
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicyPage language={language} onBackToHome={() => navigate('/')} />}
          />

          <Route
            path="/dieu-khoan-su-dung"
            element={<TermsOfServicePage language={language} onBackToHome={() => navigate('/')} />}
          />
          <Route
            path="/terms"
            element={<TermsOfServicePage language={language} onBackToHome={() => navigate('/')} />}
          />
          <Route
            path="/terms-of-service"
            element={<TermsOfServicePage language={language} onBackToHome={() => navigate('/')} />}
          />

          {/* Strict Admin Route Shield: Non-admin host -> Redirect to Home */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/quantri" element={<Navigate to="/" replace />} />
          <Route path="/admin-login" element={<Navigate to="/" replace />} />
          <Route path="/quantri24h" element={<Navigate to="/" replace />} />

          {/* Catch-all Wildcard Route -> Redirect Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Popular Links Section at Bottom of Site (When not on Home page which already includes it) */}
      {location.pathname !== '/' && (
        <PopularVinhomesLinksSection
          setCurrentTab={handleTabSwitch}
          onSelectProject={(projId) => {
            setSelectedProjectId(projId);
            navigate(`/du-an/${getProjectSlug(projId)}`);
          }}
        />
      )}

      {/* Footer */}
      <Footer
        language={language}
        setCurrentTab={handleTabSwitch}
        onOpenSecretAdmin={() => {
          if (isAdminDomain) {
            navigate('/');
          } else {
            navigate('/');
          }
        }}
        onOpenAndroidModal={() => setAndroidModalOpen(true)}
      />

      {/* Zalo Floating Contacts Widget */}
      <ZaloWidget />

      {/* Compare Side-By-Side Modal */}
      {compareModalOpen && (
        <CompareModal
          properties={properties.filter(p => compareIds.includes(p.id))}
          language={language}
          onClose={() => setCompareModalOpen(false)}
          onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
          onSelectProperty={(p) => {
            setCompareModalOpen(false);
            navigate(`/${getProjectSlug(p.project)}/${p.id}`);
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
            if (u.role === 'admin' && isAdminDomain) {
              navigate('/');
            } else {
              navigate('/tai-khoan');
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
        onOpenUpTin={() => navigate('/tai-khoan')}
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
          onClick={() => navigate('/')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            location.pathname === '/'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Trang Chủ</span>
        </button>

        <button
          onClick={() => navigate('/bat-dong-san')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            location.pathname.startsWith('/bat-dong-san') || location.pathname.startsWith('/mua-ban') || location.pathname.startsWith('/cho-thue')
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
              navigate('/dang-tin');
            }
          }}
          className="flex flex-col items-center -mt-4 group shrink-0"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900 group-active:scale-95 transition transform">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-black text-emerald-600 dark:text-emerald-400">Đăng Tin</span>
        </button>

        <button
          onClick={() => navigate('/dich-vu-cu-dan')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            location.pathname.startsWith('/dich-vu-cu-dan')
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
            } else {
              navigate('/tai-khoan');
            }
          }}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            location.pathname.startsWith('/tai-khoan')
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Cá Nhân</span>
        </button>
      </div>

      {/* Global Modals & Popup */}
      <AdBannerWidget ads={INITIAL_ADS} position="popup_modal" />

    </div>
  );
};

export default App;
