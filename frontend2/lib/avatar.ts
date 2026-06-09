import { getApiUrl } from "@/lib/auth"

const normalizePath = (p: string) => {
  if (!p) return ""
  const pic = String(p).trim()
  if (/^https?:\/\//.test(pic)) return pic

  let path = pic.startsWith("/") ? pic : `/${pic}`
  const isFilenameOnly = /^(\/)?profile-[^/]+\.(jpg|jpeg|png|gif|webp)$/i.test(path) && !path.includes("/uploads/profiles/")
  if (isFilenameOnly) {
    path = `/uploads/profiles/${path.replace(/^\//, "")}`
  }
  return path
}

const withVersion = (url: string, versionToken: string | number) => {
  if (!versionToken) return url
  return `${url}${url.includes("?") ? "&" : "?"}v=${versionToken}`
}

const toSameOriginPath = (url: string) => {
  try {
    const u = new URL(url)
    return `${u.pathname}${u.search}`
  } catch {
    return url
  }
}

export function resolveAvatarSrc(userLike: { profilePicture?: string; profilePictureType?: string; updatedAt?: string | Date; id?: string; _id?: string } | null | undefined) {
  if (!userLike) return ""

  const apiUrl = getApiUrl()
  const pic = userLike.profilePicture || ""
  const type = userLike.profilePictureType || ""
  const versionToken = userLike.updatedAt
    ? new Date(userLike.updatedAt).getTime()
    : (userLike.id || userLike._id || Date.now())

  const normalized = normalizePath(pic)
  const base = apiUrl || ""

  if (type === "custom" && normalized) {
    if (/^https?:\/\//.test(normalized)) {
      return withVersion(`${base}/api/proxy/image?url=${encodeURIComponent(normalized)}`, versionToken)
    }
    return withVersion(`${base}${normalized}`, versionToken)
  }

  if (/^default-\d+$/.test(normalized)) {
    const idx = normalized.match(/^default-(\d+)$/)?.[1] || "1"
    return withVersion(`${base}/images/default-avatars/AVATAR${idx}.jpeg`, versionToken)
  }

  if (/^https?:\/\//.test(normalized) && normalized.includes("/images/default-avatars/")) {
    return withVersion(toSameOriginPath(normalized), versionToken)
  }

  if (normalized.includes("/images/default-avatars/")) {
    return withVersion(`${base}${normalized.startsWith("/") ? normalized : `/${normalized}`}`, versionToken)
  }

  const match = String(pic).match(/^default-(\d+)$/)
  const idx = match ? match[1] : "1"
  return withVersion(`${base}/images/default-avatars/AVATAR${idx}.jpeg`, versionToken)
}

export function normalizeAvatarUrlFromApi(url: string) {
  const apiUrl = getApiUrl()
  if (!url) return ""
  if (apiUrl === "") return toSameOriginPath(url)
  return url
}
