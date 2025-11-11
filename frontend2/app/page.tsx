"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Moon, Sun, Menu, X, ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Hero from "@/components/hero"
// removed: stats and features sections
import Products from "@/components/products"
import WhyChoose from "@/components/why-choose"
import Features from "@/components/features"
import Newsletter from "@/components/newsletter"
import Footer from "@/components/footer"
import { getApiUrl as resolveApiUrl } from "@/lib/auth"
 

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)
  const { isLoggedIn, user } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Capture token from URL when arriving from dashboard and persist session locally
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const token = url.searchParams.get('token')
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('authToken', token)
        localStorage.setItem('isLoggedIn', 'true')
        url.searchParams.delete('token')
        window.history.replaceState({}, document.title, url.pathname + (url.search ? '?' + url.search : ''))
        // Notify other tabs/components
        window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: token }))
        // Proactively fetch profile to populate user for named welcome
        const API = resolveApiUrl()
        const fetchProfile = async () => {
          try {
            const res = await fetch(`${API}/api/auth/profile`, {
              headers: { 'Authorization': `Bearer ${token}` },
              cache: 'no-store'
            })
            if (!res.ok) return
            const data = await res.json().catch(() => null)
            const u = data?.user
            if (u) {
              try {
                localStorage.setItem('user', JSON.stringify(u))
                window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(u) }))
              } catch {}
            }
          } catch {}
        }
        fetchProfile()
      }
    } catch {}
  }, [])

  // Show welcome message once per session after login
  useEffect(() => {
    try {
      if (isLoggedIn && !sessionStorage.getItem('hytrade_welcome_shown')) {
        setShowWelcome(true)
        sessionStorage.setItem('hytrade_welcome_shown', '1')
        const t = window.setTimeout(() => setShowWelcome(false), 4000)
        return () => window.clearTimeout(t)
      }
      if (!isLoggedIn) {
        setShowWelcome(false)
      }
    } catch {}
  }, [isLoggedIn])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header theme={theme} toggleTheme={toggleTheme} />
      {showWelcome && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow">
            {`hey ${user?.firstName || user?.name || 'there'} welcome to hytrade`}
          </div>
        </div>
      )}
      <Hero />
      {/* Stats removed; keep Features (Trust with Confidence) and drop emoji Trust */}
      <Features />
      <Products />
      <WhyChoose />
      <Newsletter />
      <Footer />
    </div>
  )
}
