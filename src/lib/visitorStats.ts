import { useState, useEffect } from 'react';

const VIEWS_STORAGE_KEY = 'chocudan24h_total_views';
const ZALO_STORAGE_KEY = 'chocudan24h_zalo_interactions';
const INITIAL_VIEWS = 152840;
const INITIAL_ZALO = 1480;

// Read initial from localStorage or default
export function getStoredViews(): number {
  try {
    const saved = localStorage.getItem(VIEWS_STORAGE_KEY);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= INITIAL_VIEWS) return val;
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_VIEWS;
}

export function getStoredZaloInteractions(): number {
  try {
    const saved = localStorage.getItem(ZALO_STORAGE_KEY);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= INITIAL_ZALO) return val;
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_ZALO;
}

// Record page view increment
export function recordPageView(): number {
  const current = getStoredViews();
  const next = current + 1;
  try {
    localStorage.setItem(VIEWS_STORAGE_KEY, next.toString());
    window.dispatchEvent(new Event('chocudan24h_stats_updated'));
  } catch (e) {
    console.warn(e);
  }
  return next;
}

// Record Zalo interaction increment
export function recordZaloInteraction(): number {
  const current = getStoredZaloInteractions();
  const next = current + 1;
  try {
    localStorage.setItem(ZALO_STORAGE_KEY, next.toString());
    window.dispatchEvent(new Event('chocudan24h_stats_updated'));
  } catch (e) {
    console.warn(e);
  }
  return next;
}

// Global React hook to consume live statistics
export function useVisitorStats() {
  const [views, setViews] = useState<number>(getStoredViews);
  const [zaloInteractions, setZaloInteractions] = useState<number>(getStoredZaloInteractions);
  const [onlineCount, setOnlineCount] = useState<number>(48);

  useEffect(() => {
    // Record +1 page view when hook initializes in app runtime once per session
    if (!sessionStorage.getItem('chocudan24h_page_viewed_session')) {
      sessionStorage.setItem('chocudan24h_page_viewed_session', 'true');
      const updatedViews = recordPageView();
      setViews(updatedViews);
    }

    // Listener for stats updates across components
    const handleStatsChange = () => {
      setViews(getStoredViews());
      setZaloInteractions(getStoredZaloInteractions());
    };

    window.addEventListener('chocudan24h_stats_updated', handleStatsChange);
    window.addEventListener('storage', handleStatsChange);

    // Dynamic fluctuating Online User counter (between 45 and 53)
    const onlineInterval = setInterval(() => {
      // Small random fluctuation around 48 (+- 4)
      const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
      setOnlineCount(prev => {
        let next = prev + delta;
        if (next < 45) next = 46;
        if (next > 54) next = 52;
        return next;
      });
    }, 4000);

    return () => {
      window.removeEventListener('chocudan24h_stats_updated', handleStatsChange);
      window.removeEventListener('storage', handleStatsChange);
      clearInterval(onlineInterval);
    };
  }, []);

  return {
    views,
    zaloInteractions,
    onlineCount,
    recordZaloInteraction,
    recordPageView
  };
}
