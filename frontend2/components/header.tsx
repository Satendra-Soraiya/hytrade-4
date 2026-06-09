"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Moon, Sun, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { getApiUrl } from "@/lib/auth"
import { normalizeAvatarUrlFromApi, resolveAvatarSrc } from "@/lib/avatar"

interface HeaderProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  const { isLoggedIn, user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [avatarOverride, setAvatarOverride] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => setMounted(true), [])

  const dashboardUrl = useMemo(() => {
    const envDashboard = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://dashboard.hytrade.in"
    if (!mounted) return envDashboard
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    return isLocal ? "http://localhost:5174" : envDashboard
  }, [mounted])

  const avatarSrc = avatarOverride || resolveAvatarSrc(user)

  useEffect(() => {
    if (!isLoggedIn) {
      setAvatarOverride("")
      return
    }

    const API_URL = getApiUrl()
    let cancelled = false

    const fetchCanonical = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken")
        if (!token) return
        const res = await fetch(`${API_URL}/api/auth/avatar-url`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (data?.url && !cancelled) {
          setAvatarOverride(normalizeAvatarUrlFromApi(data.url))
        }
      } catch {}
    }

    fetchCanonical()
    const id = window.setInterval(fetchCanonical, 15000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [isLoggedIn, user?.profilePicture, user?.profilePictureType, user?.updatedAt])

  const dashboardHref = (() => {
    try {
      if (!mounted || !isLoggedIn) return dashboardUrl
      const t = localStorage.getItem("token") || localStorage.getItem("authToken") || ""
      if (!t) return dashboardUrl
      const sep = dashboardUrl.includes("?") ? "&" : "?"
      return `${dashboardUrl}${sep}token=${encodeURIComponent(t)}`
    } catch {
      return dashboardUrl
    }
  })()

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center">
            <img src="/logo.png" alt="Hytrade" className="h-12 w-auto object-contain sm:h-14" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Products</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {mounted && !isLoggedIn && (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Login</Link>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}

            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={dashboardHref}>
                <Rocket className="h-4 w-4" />
                {mounted && isLoggedIn ? "Dashboard" : "Launch app"}
              </a>
            </Button>

            {mounted && isLoggedIn && (
              <>
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={avatarSrc} alt={user?.firstName || "User"} className="object-cover" />
                  <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden sm:inline-flex">
                  {loggingOut ? "Logging out…" : "Logout"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
