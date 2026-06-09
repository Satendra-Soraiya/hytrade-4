export function getDashboardUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:5174'
  }
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const envDash = process.env.NEXT_PUBLIC_DASHBOARD_URL
  return envDash || (isLocal ? 'http://localhost:5174' : 'https://dashboard.hytrade.in')
}

export function dashboardHref(withToken = false) {
  const base = getDashboardUrl()
  if (!withToken || typeof window === 'undefined') return base
  try {
    const t = localStorage.getItem('token') || localStorage.getItem('authToken') || ''
    if (!t) return base
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}token=${encodeURIComponent(t)}`
  } catch {
    return base
  }
}
