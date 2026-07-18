const CSRF_STORAGE_KEY = 'rectotime_csrf_token';
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

export const setCsrfToken = (token: string): void => {
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
};

export const getCsrfToken = (): string | null => {
  return sessionStorage.getItem(CSRF_STORAGE_KEY);
};

export const clearCsrfToken = (): void => {
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
};

export const getCsrfHeaders = (baseHeaders: HeadersInit = {}): HeadersInit => {
  const token = getCsrfToken();
  if (!token) {
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    'X-CSRF-Token': token,
  };
};

export const refreshCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (data?.ok && typeof data.csrfToken === 'string') {
      setCsrfToken(data.csrfToken);
      return data.csrfToken;
    }
    return null;
  } catch {
    return null;
  }
};

export const csrfFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryOnCsrfFailure = true
): Promise<Response> => {
  const method = (init.method || 'GET').toUpperCase();
  const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const headers = isStateChanging ? getCsrfHeaders(init.headers || {}) : (init.headers || {});
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (response.status === 403 && isStateChanging && retryOnCsrfFailure) {
    const token = await refreshCsrfToken();
    if (!token) {
      return response;
    }

    const retryHeaders = getCsrfHeaders(init.headers || {});
    return fetch(input, {
      ...init,
      credentials: 'include',
      headers: retryHeaders,
    });
  }

  return response;
};
