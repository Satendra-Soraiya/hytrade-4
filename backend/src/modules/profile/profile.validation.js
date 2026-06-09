const { config } = require('../../config/env');

function isAllowedCustomPicture(value) {
  if (!value || typeof value !== 'string') return false;
  const pic = value.trim();
  if (/^default-\d+$/.test(pic)) return true;
  if (/^\/uploads\/profiles\/[a-zA-Z0-9._-]+$/.test(pic)) return true;
  if (/^https?:\/\//i.test(pic)) {
    try {
      const parsed = new URL(pic);
      if (parsed.pathname.includes('/profiles/')) return true;
      if (config.awsS3PublicBaseUrl) {
        const base = new URL(config.awsS3PublicBaseUrl);
        if (parsed.host === base.host) return true;
      }
      if (parsed.host.endsWith('amazonaws.com') && parsed.pathname.includes('/profiles/')) return true;
    } catch {
      return false;
    }
  }
  return false;
}

function normalizeProfilePictureUpdate({ profilePicture, profilePictureType }) {
  if (profilePicture === undefined && profilePictureType === undefined) {
    return null;
  }

  const type = profilePictureType || 'default';
  const pic = String(profilePicture || '').trim();

  if (type === 'default') {
    const match = pic.match(/^default-(\d+)$/);
    if (!match && pic.includes('/images/default-avatars/')) {
      const fileMatch = pic.match(/AVATAR(\d+)\./i);
      if (fileMatch) return { profilePicture: `default-${fileMatch[1]}`, profilePictureType: 'default' };
    }
    if (!/^default-\d+$/.test(pic)) {
      throw new Error('Default avatar must use id format default-N');
    }
    return { profilePicture: pic, profilePictureType: 'default' };
  }

  if (type === 'custom') {
    if (!isAllowedCustomPicture(pic)) {
      throw new Error('Invalid custom profile picture reference');
    }
    return { profilePicture: pic, profilePictureType: 'custom' };
  }

  throw new Error('Invalid profile picture type');
}

function resolveDefaultAvatarIndex(profilePicture) {
  const id = resolveDefaultAvatarId(profilePicture);
  const match = id.match(/^default-(\d+)$/);
  return match ? match[1] : '1';
}

function resolveDefaultAvatarId(profilePicture) {
  const pic = String(profilePicture || '').trim();
  const idMatch = pic.match(/^default-(\d+)$/);
  if (idMatch) return `default-${idMatch[1]}`;
  const fileMatch = pic.match(/AVATAR(\d+)\./i);
  if (fileMatch) return `default-${fileMatch[1]}`;
  return 'default-1';
}

function defaultAvatarFilename(index) {
  return `AVATAR${index}.jpeg`;
}

module.exports = {
  isAllowedCustomPicture,
  normalizeProfilePictureUpdate,
  resolveDefaultAvatarIndex,
  resolveDefaultAvatarId,
  defaultAvatarFilename,
};
