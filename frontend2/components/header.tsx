"use client"

import { Moon, Sun, TrendingUp, Rocket } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'
import { useAuth } from "@/contexts/AuthContext"

interface HeaderProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  const { isLoggedIn, user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const dashboardUrl = (() => {
    const envDashboard = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.hytrade.in'
    if (!mounted) return envDashboard
    const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    return isLocal ? 'http://localhost:5174' : envDashboard
  })()
  // Always use same-origin relative paths for internal navigation
  const loginHref = '/login'
  const signupHref = '/signup'
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  // No query-param based avatar; always use canonical backend URL

  const getApiUrl = () => {
    let api = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com')
    try {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname
        const port = window.location.port
        const isHytradeProd = /(^|\.)hytrade\.in$/.test(host)
        const isLocalLanding = (host === 'localhost' || host === '127.0.0.1') && port === '3001'
        // Use same-origin path in both local dev and production domains; Next rewrites proxy to backend
        if (isHytradeProd || isLocalLanding) {
          return ''
        }
        if (window.location.protocol === 'https:') {
          const u = new URL(api)
          if (u.protocol === 'http:') {
            u.protocol = 'https:'
            api = u.toString().replace(/\/$/, '')
          }
        }
      }
    } catch {}
    return api
  }

  // Auto-refresh avatar from canonical endpoint on focus and every 15s
  useEffect(() => {
    if (!isLoggedIn) return
    const API_URL = getApiUrl()

    let cancelled = false

    const fetchCanonical = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken')
        if (!token) return
        const res = await fetch(`${API_URL}/api/auth/avatar-url`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (data?.url && !cancelled) {
          setAvatarUrl((prev) => (prev !== data.url ? data.url : prev))
        }
      } catch {}
    }

    fetchCanonical()
    const onFocus = () => { fetchCanonical() }
    window.addEventListener('focus', onFocus)
    const id = window.setInterval(fetchCanonical, 15000)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.clearInterval(id)
    }
  }, [isLoggedIn])

  const normalizePath = (p: string) => {
    if (!p) return ''
    const pic = String(p).trim()
    if (/^https?:\/\//.test(pic)) return pic
    let path = pic.startsWith('/') ? pic : `/${pic}`
    const isFilenameOnly = /^(\/)?profile-[^/]+\.(jpg|jpeg|png|gif)$/i.test(path) && !path.includes('/uploads/profiles/')
    if (isFilenameOnly) {
      const filename = path.replace(/^\//, '')
      path = `/uploads/profiles/${filename}`
    }
    if (/^\/uploads\//.test(path) || /^\/images\//.test(path)) return path
    if (/^uploads\//.test(pic) || /^images\//.test(pic)) return `/${pic}`
    return path
  }

  const routeViaProxyIfCrossOrigin = (url: string, apiUrl: string) => {
    try {
      const u = new URL(url)
      const api = new URL(apiUrl)
      if (u.host !== api.host) {
        return `${apiUrl}/api/proxy/image?url=${encodeURIComponent(url)}`
      }
    } catch {}
    return url
  }

  const resolveAvatarSrc = (userLike: any) => {
    const apiUrl = getApiUrl()
    const pic = (
      userLike?.profilePicture ||
      userLike?.avatar ||
      userLike?.avatarUrl ||
      userLike?.photo ||
      userLike?.profile?.profilePicture ||
      userLike?.profile?.picture ||
      ''
    )
    let type = userLike?.profilePictureType || userLike?.avatarType || ''
    const versionToken = userLike?.updatedAt ? new Date(userLike.updatedAt).getTime() : Date.now()

    const normalized = normalizePath(pic)

    // Infer custom if it looks like a custom upload or external URL
    if (!type && ( /^https?:\/\//.test(normalized) || /(^\/uploads\/)|(^uploads\/)|profile-[^/]+\.(jpg|jpeg|png|gif)$/i.test(normalized) )) {
      type = 'custom'
    }

    if (type === 'custom') {
      if (!normalized) return ''
      if (/^https?:\/\//.test(normalized)) {
        const proxied = routeViaProxyIfCrossOrigin(normalized, apiUrl)
        return `${proxied}${proxied.includes('?') ? '&' : '?'}v=${versionToken}`
      }
      const url = `${apiUrl}${normalized}`
      return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`
    }

    if (/^https?:\/\//.test(normalized)) {
      const proxied = routeViaProxyIfCrossOrigin(normalized, apiUrl)
      return `${proxied}${proxied.includes('?') ? '&' : '?'}v=${versionToken}`
    }

    if (/^\/.+\.[a-zA-Z]+$/.test(normalized) || normalized.includes('/images/default-avatars/')) {
      const url = `${apiUrl}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
      return `${url}${url.includes('?') ? '&' : '?'}v=${versionToken}`
    }

    const match = normalized.match(/^default-(\d+)$/)
    const idx = match ? match[1] : '1'
    const url = `${apiUrl}/images/default-avatars/AVATAR${idx}.jpeg`
    return `${url}?v=${versionToken}`
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
      const url = new URL(window.location.href)
      url.searchParams.set('message', 'You have been logged out successfully')
      window.location.href = url.pathname + '?' + url.searchParams.toString()
    }
  }
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Hytrade Logo"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </a>

          {/* Navigation */}
          <nav className="hidden gap-8 md:flex">
            <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Support
            </a>
          </nav>

          {/* CTA and Theme Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg p-3 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-foreground" />
              )}
            </button>
            {(!mounted || !isLoggedIn) && (
              <>
                <a href={loginHref} className="hidden text-base font-medium text-foreground hover:text-primary sm:inline">
                  Login
                </a>
                <a href={signupHref}>
                  <Button className="hidden bg-primary hover:bg-primary/90 text-primary-foreground sm:inline-flex text-base px-5 py-2.5">
                    Sign Up
                  </Button>
                </a>
              </>
            )}
            <a href={`${(() => {
              try {
                if (!mounted || !isLoggedIn) return dashboardUrl
                const t = localStorage.getItem('token') || localStorage.getItem('authToken') || ''
                if (!t) return dashboardUrl
                const sep = dashboardUrl.includes('?') ? '&' : '?'
                return `${dashboardUrl}${sep}token=${encodeURIComponent(t)}`
              } catch { return dashboardUrl }
            })()}`}
               className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-base font-medium hover:bg-secondary transition-colors">
              <Rocket className="h-5 w-5" />
              {mounted && isLoggedIn ? 'Dashboard' : 'Launch App'}
            </a>
            {mounted && isLoggedIn && (
              <div className="ml-1 h-10 w-10 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                {(!imgFailed && (avatarUrl || resolveAvatarSrc(user))) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl || resolveAvatarSrc(user)}
                    alt={user?.firstName || 'User'}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <span>
                    {(user?.firstName?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </div>
            )}
            {mounted && isLoggedIn && (
              <Button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex bg-secondary text-foreground hover:bg-secondary/80 text-base px-4 py-2.5"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
