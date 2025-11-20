// Centralized avatar resolver for consistent rendering across the app
// Produces a final image src URL that is safe for same-origin policies

const getApiUrl = () => {
  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const viteUrl = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || null;
  const reactUrl = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || null;
  return viteUrl || reactUrl || (isDev ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
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
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentHost = currentOrigin ? new URL(currentOrigin).host : '';
    const apiHost = new URL(apiUrl).host;
    const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // In local dev, prefer same-origin proxy to avoid cross-origin image fetch issues
    if (isLocalDev && currentHost && u.host !== currentHost) {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }

    // Otherwise, fall back to backend-hosted proxy when crossing origins
    if (u.host !== apiHost) {
      return `${apiUrl}/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
  } catch (_) {}
  return url;
};

export const resolveAvatarSrc = (userLike, options = {}) => {
  const apiUrl = options.API_URL || getApiUrl();
  const pic = userLike?.profilePicture || '';
  const type = userLike?.profilePictureType || '';
  const versionToken = userLike?.updatedAt ? new Date(userLike.updatedAt).getTime() : Date.now();

  // Normalize first
  const normalized = normalizePath(pic);

  // Custom uploads
  if (type === 'custom') {
    if (!normalized) return '';
    if (/^https?:\/\//.test(normalized)) {
      const final = routeViaProxyIfCrossOrigin(normalized, apiUrl);
      return `${final}${final.includes('?') ? '&' : '?'}v=${versionToken}`;
    }
    // relative or filename-only
    const absolute = `${apiUrl}${normalized}`;
    const final = routeViaProxyIfCrossOrigin(absolute, apiUrl);
    return `${final}${final.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  // Default avatars: handle id like "default-5" or direct path
  if (/^https?:\/\//.test(normalized)) {
    const final = routeViaProxyIfCrossOrigin(normalized, apiUrl);
    return `${final}${final.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  // If direct relative image path
  if (/^\/.+\.[a-zA-Z]+$/.test(normalized) || normalized.includes('/images/default-avatars/')) {
    const absolute = `${apiUrl}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
    const final = routeViaProxyIfCrossOrigin(absolute, apiUrl);
    return `${final}${final.includes('?') ? '&' : '?'}v=${versionToken}`;
  }

  // If stored as id `default-N`
  const match = normalized.match(/^default-(\d+)$/);
  const idx = match ? match[1] : '1';
  const absoluteDefault = `${apiUrl}/images/default-avatars/AVATAR${idx}.jpeg`;
  const final = routeViaProxyIfCrossOrigin(absoluteDefault, apiUrl);
  return `${final}${final.includes('?') ? '&' : '?'}v=${versionToken}`;
};

export default resolveAvatarSrc;