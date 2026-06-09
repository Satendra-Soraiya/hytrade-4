/** Hytrade marketing / landing site (frontend2) */
export function getLandingUrl() {
  const envFrontend = import.meta.env.VITE_FRONTEND_URL;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const fallback = isLocal ? 'http://localhost:3001' : 'https://www.hytrade.in';
  return envFrontend || fallback;
}
