const DEFAULT_LOCAL_API = 'http://127.0.0.1:8000/api/v1';
const DEFAULT_PROD_API = 'https://api.libraryconnekto.me/api/v1';

/**
 * API base URL:
 * - VITE_API_BASE_URL when set (Vercel/production or explicit override)
 * - npm run dev → local backend (unless .env.local overrides)
 * - production build → live API
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? DEFAULT_LOCAL_API : DEFAULT_PROD_API)
).replace(/\/$/, '');

/** Backend origin without /api/v1 — used for /uploads static files. */
export const SERVER_BASE_URL = (
  import.meta.env.VITE_SERVER_BASE_URL ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, '') ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://api.libraryconnekto.me')
).replace(/\/$/, '');

const DEV_MEDIA_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;

/** Turn a stored path like /uploads/abc.jpg into a full URL for <img src>. */
export const resolveMediaUrl = (path) => {
  if (!path) return '';
  const raw = String(path).trim();
  if (!raw) return '';

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const u = new URL(raw);
      if (DEV_MEDIA_HOSTS.test(u.hostname) && u.pathname.startsWith('/uploads/')) {
        return `${SERVER_BASE_URL}${u.pathname}`;
      }
    } catch {
      /* keep raw */
    }
    return raw;
  }

  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${SERVER_BASE_URL}${normalized}`;
};

const TOKEN_KEY = 'auth_token';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch (_) {
    return '';
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch (_) {}
};

export const removeAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
};

export const redirectToLogin = () => {
  // Avoid redirect loops if already on a public auth page
  const currentPath = window.location.pathname;
  const authPaths = [
    '/admin/auth',
    '/admin/reset-password',
    '/student/login',
    '/student/forgot-password',
    '/student/set-password',
    '/auth/verify-success',
    '/auth/verify-error',
  ];
  if (!authPaths.some((p) => currentPath.startsWith(p))) {
    window.location.href = '/admin/auth';
  }
};

export const isTokenValid = () => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    // Basic JWT decode to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (_) {
    return false;
  }
};

const DEFAULT_REQUEST_TIMEOUT_MS = 90000;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getHeaders(extra = {}, includeAuth = true) {
    const headers = { ...extra };
    if (includeAuth) {
      const token = getAuthToken();
      if (token) {
        // Proactively check expiry before sending - avoids a wasted round-trip
        if (!isTokenValid()) {
          removeAuthToken();
          redirectToLogin();
          throw new Error('Session expired. Please log in again.');
        }
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async request(endpoint, options = {}, includeAuth = true, retryOptions = null) {
    const maxAttempts = retryOptions?.maxAttempts ?? 1;
    const retryDelays = retryOptions?.retryDelays ?? [2000, 4000, 8000];
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this._requestOnce(endpoint, options, includeAuth);
      } catch (err) {
        lastError = err;
        const status = err?.status;
        const canRetry =
          attempt < maxAttempts &&
          (RETRYABLE_STATUS.has(status) ||
            /gateway timeout|network error|failed to fetch/i.test(err?.message || ''));
        if (!canRetry) break;
        await new Promise((r) => setTimeout(r, retryDelays[attempt - 1] ?? 4000));
      }
    }
    throw lastError;
  }

  async requestWithRetry(endpoint, options = {}, includeAuth = true) {
    return this.request(endpoint, options, includeAuth, {
      maxAttempts: 4,
      retryDelays: [2000, 4000, 8000],
    });
  }

  async _requestOnce(endpoint, options = {}, includeAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(options.headers, includeAuth);
    const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const config = {
      ...options,
      headers,
      signal: controller.signal,
    };
    delete config.timeoutMs;

    let res;
    try {
      res = await fetch(url, config);
    } catch (err) {
      if (err?.name === 'AbortError') {
        const timeoutErr = new Error(
          'Payment received — confirming your booking. Please wait or tap Confirm.',
        );
        timeoutErr.status = 504;
        throw timeoutErr;
      }
      const networkErr = new Error(err?.message || 'Network error');
      networkErr.status = 0;
      throw networkErr;
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      let message = res.statusText || `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data) {
          if (Array.isArray(data.detail)) {
            // e.g., FastAPI validation errors: include field path
            message = data.detail
              .map((d) => {
                const path = Array.isArray(d.loc) ? d.loc.join('.') : d.loc;
                const msg = d.msg || d.message || JSON.stringify(d);
                return path ? `${path}: ${msg}` : msg;
              })
              .join('; ');
          } else if (typeof data.detail === 'object') {
            message = JSON.stringify(data.detail);
          } else {
            message = data.detail || data.message || message;
          }
        }
      } catch (_) {}

      // 401 = token rejected by server (expired/invalid), 403 "Not authenticated" = no token sent
      // Both mean the session is gone — clear and redirect to login.
      if (includeAuth && (res.status === 401 || (res.status === 403 && message === 'Not authenticated'))) {
        removeAuthToken();
        redirectToLogin();
        throw new Error('Session expired. Please log in again.');
      }
      
      const apiErr = new Error(
        res.status === 504
          ? 'Payment received — confirming your booking. Please wait or tap Confirm.'
          : message,
      );
      apiErr.status = res.status;
      throw apiErr;
    }
    // Some endpoints might return 204
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return res.json();
  }

  get(endpoint, includeAuth = true, useRetry = false) {
    const fn = useRetry ? this.requestWithRetry.bind(this) : this.request.bind(this);
    return fn(endpoint, { method: 'GET' }, includeAuth);
  }
  post(endpoint, body, includeAuth = true, useRetry = false) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const fn = useRetry ? this.requestWithRetry.bind(this) : this.request.bind(this);
    return fn(
      endpoint,
      { method: 'POST', body: isFormData ? body : JSON.stringify(body), headers },
      includeAuth,
    );
  }
  put(endpoint, body, includeAuth = true) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    return this.request(
      endpoint,
      { method: 'PUT', body: isFormData ? body : JSON.stringify(body), headers },
      includeAuth
    );
  }
  del(endpoint, includeAuth = true) {
    return this.request(endpoint, { method: 'DELETE' }, includeAuth);
  }
  delete(endpoint, includeAuth = true) {
    return this.del(endpoint, includeAuth);
  }

  // Anonymous methods for public endpoints
  getAnonymous(endpoint, useRetry = false) {
    return this.get(endpoint, false, useRetry);
  }
  postAnonymous(endpoint, body, useRetry = false) {
    return this.post(endpoint, body, false, useRetry);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const checkHealth = async () => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (_) {
    return false;
  }
};
