// Centralized avatar resolver for the legacy frontend (CRA)
// Ensures consistent, same-origin-safe image URLs with cache busting

const getApiUrl = () => {
  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  let base = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || (isDev ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
  try {
    // If the page is HTTPS and base is HTTP for same host, force HTTPS to avoid mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      const u = new URL(base);
      if (u.protocol === 'http:') {
        u.protocol = 'https:';
        base = u.toString().replace(/\/$/, '');
      }
    }
  } catch (_) {}
  return base;
};

const normalizePath = (p) => {
  if (!p) return '';
  const pic = String(p).trim();
  if (/^https?:\/\//.test(pic)) return pic; // absolute URL
  let path = pic.startsWith('/') ? pic : `/${pic}`;

  // Filename-only for uploads: profile-<id>.<ext>
  const isFilenameOnly = /^(\/)?profile-[^/]+\.(jpg|jpeg|png|gif)$/i.test(path) && !path.includes('/uploads/profiles/');
  if (isFilenameOnly) {
    const filename = path.replace(/^\//, '');
    path = `/uploads/profiles/${filename}`;
  }

  if (/^\/uploads\//.test(path) || /^\/images\//.test(path)) return path;
  if (/^uploads\//.test(pic) || /^images\//.test(pic)) return `/${pic}`;

  return path;
};

const routeViaProxyIfCrossOrigin = (url, apiUrl) => {
  try {
    const u = new URL(url);
    const api = new URL(apiUrl);
    const pageHost = typeof window !== 'undefined' ? window.location.host : '';
    // Proxy if the image host is not the same as the current page host
    if (u.host !== pageHost) {
      return `${api.origin}/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    // If the image is on the API host but pageHost differs, also proxy
    if (api.host !== pageHost) {
      return `${api.origin}/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
  } catch (_) {}
  return url;
};

export const resolveAvatarSrc = (userLike, options = {}) => {
  const apiUrl = options.API_URL || getApiUrl();
  const pic = userLike?.profilePicture || '';
  const type = userLike?.profilePictureType || '';
  const versionToken = userLike?.updatedAt ? new Date(userLike.updatedAt).getTime() : Date.now();

  const normalized = normalizePath(pic);

  // Custom uploads
  if (type === 'custom') {
    if (!normalized) return '';
    if (/^https?:\/\//.test(normalized)) {
      const url = routeViaProxyIfCrossOrigin(normalized, apiUrl);
      return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
    }
    let url = `${apiUrl}${normalized}`;
    url = routeViaProxyIfCrossOrigin(url, apiUrl);
    return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  // Default avatars
  if (/^https?:\/\//.test(normalized)) {
    const url = routeViaProxyIfCrossOrigin(normalized, apiUrl);
    return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  if (/^\/.*\.[a-zA-Z]+$/.test(normalized) || normalized.includes('/images/default-avatars/')) {
    let url = `${apiUrl}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
    url = routeViaProxyIfCrossOrigin(url, apiUrl);
    return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  const match = normalized.match(/^default-(\d+)$/);
  let idx = match ? parseInt(match[1], 10) : 1;
  // Clamp to a safe available range (1..12) and wrap if out of range
  const MAX_DEFAULTS = 12;
  if (!Number.isFinite(idx) || idx < 1) idx = 1;
  if (idx > MAX_DEFAULTS) idx = ((idx - 1) % MAX_DEFAULTS) + 1;
  let url = `${apiUrl}/images/default-avatars/AVATAR${idx}.jpeg`;
  url = routeViaProxyIfCrossOrigin(url, apiUrl);
  return `${url}?v=${versionToken}`;
};

export default resolveAvatarSrc;