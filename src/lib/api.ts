/**
 * API auth helpers — JWT token storage + global fetch patch.
 *
 * Mọi fetch() trong app đều tự động gắn header `Authorization: Bearer <token>`
 * nếu token tồn tại trong localStorage. Khi server trả 401, token bị xóa
 * (phiên hết hạn) để buộc đăng nhập lại.
 */

const TOKEN_KEY = 'chocudan24h_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
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