const getApiUrl = () => {
  const isLocal = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const onViteDashboard = isLocal && ['5173', '5174'].includes(window.location.port);
  if (onViteDashboard) return '';

  const viteUrl = import.meta?.env?.VITE_API_URL || null;
  return viteUrl?.replace(/\/$/, '') || (isLocal ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
};

const normalizePath = (p) => {
  if (!p) return '';
  const pic = String(p).trim();
  if (/^https?:\/\//.test(pic)) return pic;

  let path = pic.startsWith('/') ? pic : `/${pic}`;
  const isFilenameOnly = /^(\/)?profile-[^/]+\.(jpg|jpeg|png|gif)$/i.test(path) && !path.includes('/uploads/profiles/');
  if (isFilenameOnly) {
    path = `/uploads/profiles/${path.replace(/^\//, '')}`;
  }
  return path;
};

const withVersion = (url, versionToken) => {
  if (!versionToken) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`;
};

const routeViaProxyIfCrossOrigin = (url, apiUrl) => {
  if (!apiUrl) return url;
  try {
    const u = new URL(url, window.location.origin);
    const apiHost = new URL(apiUrl).host;
    if (u.host !== apiHost) {
      return `${apiUrl}/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }
  return url;
};

export const resolveDefaultAvatarId = (profilePicture) => {
  const pic = String(profilePicture || '').trim();
  const idMatch = pic.match(/^default-(\d+)$/);
  if (idMatch) return `default-${idMatch[1]}`;
  const fileMatch = pic.match(/AVATAR(\d+)\./i);
  if (fileMatch) return `default-${fileMatch[1]}`;
  return 'default-1';
};

export const resolveAvatarSrc = (userLike, options = {}) => {
  const apiUrl = options.API_URL !== undefined ? options.API_URL : getApiUrl();
  const pic = userLike?.profilePicture || '';
  const type = userLike?.profilePictureType || '';
  const versionToken = userLike?.updatedAt
    ? new Date(userLike.updatedAt).getTime()
    : (userLike?.id || userLike?._id || '');

  const normalized = normalizePath(pic);
  const base = apiUrl || '';

  if (type === 'custom' && normalized) {
    if (/^https?:\/\//.test(normalized)) {
      return withVersion(routeViaProxyIfCrossOrigin(normalized, apiUrl || 'http://localhost:3002'), versionToken);
    }
    const absolute = `${base}${normalized}`;
    return withVersion(routeViaProxyIfCrossOrigin(absolute, apiUrl || window.location.origin), versionToken);
  }

  if (/^default-\d+$/.test(normalized)) {
    const idx = normalized.match(/^default-(\d+)$/)[1];
    return withVersion(`${base}/images/default-avatars/AVATAR${idx}.jpeg`, versionToken);
  }

  if (/^https?:\/\//.test(normalized) && normalized.includes('/images/default-avatars/')) {
    return withVersion(routeViaProxyIfCrossOrigin(normalized, apiUrl || 'http://localhost:3002'), versionToken);
  }

  if (normalized.includes('/images/default-avatars/')) {
    return withVersion(`${base}${normalized.startsWith('/') ? normalized : `/${normalized}`}`, versionToken);
  }

  const match = String(pic).match(/^default-(\d+)$/);
  const idx = match ? match[1] : '1';
  return withVersion(`${base}/images/default-avatars/AVATAR${idx}.jpeg`, versionToken);
};

export default resolveAvatarSrc;
