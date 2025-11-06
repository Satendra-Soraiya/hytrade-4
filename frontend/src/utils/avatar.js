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

  // Helper to build an initials placeholder data URL
  const getInitials = () => {
    const fn = (userLike?.firstName || '').trim();
    const ln = (userLike?.lastName || '').trim();
    const email = (userLike?.email || '').trim();
    let initials = '';
    if (fn || ln) {
      initials = `${fn ? fn[0] : ''}${ln ? ln[0] : ''}`.toUpperCase();
    } else if (email) {
      const parts = email.split('@')[0];
      initials = (parts.slice(0, 2) || 'U').toUpperCase();
    } else {
      initials = 'U';
    }
    return initials;
  };

  const buildInitialsSvg = () => {
    const initials = getInitials();
    const bg = '#e5e7eb';
    const fg = '#111827';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <rect width="100%" height="100%" rx="16" ry="16" fill="${bg}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700" fill="${fg}">${initials}</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // If no type is provided, or unrecognized, return initials placeholder
  if (!type || (type !== 'custom' && type !== 'default')) {
    return buildInitialsSvg();
  }

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

  // Default avatars (only when explicitly chosen)
  if (/^https?:\/\//.test(normalized)) {
    let abs = normalized;
    // If absolute URL points to our default avatar path, clamp the index
    try {
      const u = new URL(abs);
      const m = u.pathname.match(/\/images\/default-avatars\/AVATAR(\d+)\.jpe?g$/i);
      if (m) {
        const MAX_DEFAULTS = 12;
        let n = parseInt(m[1], 10);
        if (!Number.isFinite(n) || n < 1) n = 1;
        if (n > MAX_DEFAULTS) n = ((n - 1) % MAX_DEFAULTS) + 1;
        u.pathname = u.pathname.replace(/AVATAR\d+\.jpe?g$/i, `AVATAR${n}.jpeg`);
        // Force https if page is https to avoid mixed content
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          u.protocol = 'https:';
        }
        abs = u.toString();
      }
    } catch (_) {}
    const url = routeViaProxyIfCrossOrigin(abs, apiUrl);
    return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  if (/^\/.*\.[a-zA-Z]+$/.test(normalized) || normalized.includes('/images/default-avatars/')) {
    let path = normalized.startsWith('/') ? normalized : `/${normalized}`;
    // Clamp AVATAR index in filename if present (e.g., AVATAR15.jpeg)
    const m = path.match(/\/images\/default-avatars\/AVATAR(\d+)\.jpe?g$/i);
    if (m) {
      const MAX_DEFAULTS = 12;
      let n = parseInt(m[1], 10);
      if (!Number.isFinite(n) || n < 1) n = 1;
      if (n > MAX_DEFAULTS) n = ((n - 1) % MAX_DEFAULTS) + 1;
      path = path.replace(/AVATAR\d+\.jpe?g$/i, `AVATAR${n}.jpeg`);
    }
    let url = `${apiUrl}${path}`;
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