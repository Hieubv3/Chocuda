/**
 * API auth helpers — JWT token storage + global fetch patch.
 *
 * Mọi fetch() trong app đều tự động gắn header `Authorization: Bearer <token>`
 * nếu token tồn tại trong localStorage. Khi server trả 401, token bị xóa
 * (phiên hết hạn) để buộc đăng nhập lại.
 */

const TOKEN_KEY = 'chocudan24h_token';

const COOKIE_NAME = 'chocudan24h_token';
const COOKIE_DOMAIN = (typeof location !== 'undefined' && /(^|\.)chocudan24h\.com$/.test(location.hostname)) ? '; domain=.chocudan24h.com' : '';

export function getToken(): string | null {
  try {
    const ls = localStorage.getItem(TOKEN_KEY);
    if (ls) return ls;
  } catch {
    // ignore
  }
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]+)'));
    if (m) return decodeURIComponent(m[1]);
  } catch {
    // ignore
  }
  return null;
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  try {
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(token) + COOKIE_DOMAIN + '; path=/; max-age=' + (60 * 60 * 24 * 30) + '; SameSite=Lax';
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
  try {
    document.cookie = COOKIE_NAME + '=;' + COOKIE_DOMAIN + '; path=/; max-age=0';
  } catch {
    // ignore
  }
}

/** Gắn Authorization header vào mọi fetch request nếu có token. */
export function installAuthFetchPatch(): void {
  if (typeof window === 'undefined' || (window as any).__chocudan24h_auth_patch_installed) {
    return;
  }
  (window as any).__chocudan24h_auth_patch_installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = getToken();
    if (token) {
      const headers = new Headers(init?.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...(init || {}), headers };
    }

    const res = await originalFetch(input, init);

    // Phiên hết hạn / token không hợp lệ -> xóa token
    if (res.status === 401) {
      clearToken();
    }
    return res;
  };
}