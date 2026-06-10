export function getApiUrl() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  );
  return isDev ? 'http://localhost:3002' : 'https://api.hytrade.in';
}

export async function fetchWithAuth(path, { token, ...options } = {}) {
  const API_URL = getApiUrl();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API_URL}${path}`, { ...options, headers });
}
