export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

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

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getHeaders(extra = {}, includeAuth = true) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (includeAuth) {
      const token = getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}, includeAuth = true) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(options.headers, includeAuth);

    const config = { ...options, headers };

    const res = await fetch(url, config);
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
      
      // Handle 401 as authentication issue (clear token). Do not clear on 403.
      if (res.status === 401 && includeAuth) {
        removeAuthToken();
        throw new Error('Not authenticated');
      }
      
      throw new Error(message);
    }
    // Some endpoints might return 204
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return res.json();
  }

  get(endpoint, includeAuth = true) {
    return this.request(endpoint, { method: 'GET' }, includeAuth);
  }
  post(endpoint, body, includeAuth = true) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }, includeAuth);
  }
  put(endpoint, body, includeAuth = true) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }, includeAuth);
  }
  del(endpoint, includeAuth = true) {
    return this.request(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Anonymous methods for public endpoints
  getAnonymous(endpoint) {
    return this.get(endpoint, false);
  }
  postAnonymous(endpoint, body) {
    return this.post(endpoint, body, false);
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
