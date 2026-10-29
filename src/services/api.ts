const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // Production default fallback pointing directly to the live Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://chat-app-st83.onrender.com/api';
  }
  // Local development / Vite dev proxy fallback
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type') || '';
    let data: any = {};

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (
        response.status === 405 ||
        (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost')
      ) {
        return {
          success: false,
          message: 'Backend server is not connected. Please configure VITE_API_URL in your Vercel Project Settings pointing to your Render backend URL.',
        };
      }
      if (response.status === 502 || response.status === 503) {
        return {
          success: false,
          message: 'Backend server is waking up from standby. Please wait 15 seconds and try again.',
        };
      }
      return {
        success: false,
        message: text || `HTTP error! Status: ${response.status}`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! Status: ${response.status}`,
        requiresVerification: data.requiresVerification,
        email: data.email,
        data: data.data,
      };
    }

    return data;
  } catch (err: any) {
    console.error('API Fetch error:', err);
    if (!import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return {
        success: false,
        message: 'Backend server is not connected. Please configure VITE_API_URL in your Vercel Project Settings pointing to your Render backend URL.',
      };
    }
    return {
      success: false,
      message: err.message || 'Network error or backend unavailable',
    };
  }
};
