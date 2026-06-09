import { getApiUrl } from './api';

/** Proxied through backend so logos load reliably (no hotlink blocks). */
export function getStockLogoUrl(symbol) {
  const s = String(symbol || '').trim();
  if (!s) return '';
  const base = getApiUrl();
  return `${base}/api/market/logo/${encodeURIComponent(s)}`;
}

export function stockInitials(symbol, name) {
  if (symbol) return String(symbol).slice(0, 2).toUpperCase();
  if (name) return String(name).slice(0, 2).toUpperCase();
  return '—';
}

export function stockAvatarColor(symbol) {
  let hash = 0;
  const str = String(symbol || '');
  for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hues = [215, 168, 142, 262, 199, 24, 330];
  return hues[Math.abs(hash) % hues.length];
}
