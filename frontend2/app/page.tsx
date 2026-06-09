"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getApiUrl as resolveApiUrl } from "@/lib/auth"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Stats from "@/components/stats"
import Features from "@/components/features"
import Products from "@/components/products"
import WhyChoose from "@/components/why-choose"
import Trust from "@/components/trust"
import Newsletter from "@/components/newsletter"
import Footer from "@/components/footer"

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
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const token = url.searchParams.get("token")
      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("authToken", token)
        localStorage.setItem("isLoggedIn", "true")
        url.searchParams.delete("token")
        window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.search}` : ""))
        window.dispatchEvent(new StorageEvent("storage", { key: "token", newValue: token }))
        const API = resolveApiUrl()
        fetch(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              localStorage.setItem("user", JSON.stringify(data.user))
              window.dispatchEvent(new StorageEvent("storage", { key: "user", newValue: JSON.stringify(data.user) }))
            }
          })
          .catch(() => {})
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (isLoggedIn && !sessionStorage.getItem("hytrade_welcome_shown")) {
        setShowWelcome(true)
        sessionStorage.setItem("hytrade_welcome_shown", "1")
        const t = window.setTimeout(() => setShowWelcome(false), 4000)
        return () => window.clearTimeout(t)
      }
      if (!isLoggedIn) setShowWelcome(false)
    } catch {}
  }, [isLoggedIn])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header theme={theme} toggleTheme={toggleTheme} />
      {showWelcome && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
            {`Welcome back, ${user?.firstName || user?.name || "trader"}!`}
          </div>
        </div>
      )}
      <Hero />
      <Stats />
      <Features />
      <Products />
      <Trust />
      <WhyChoose />
      <Newsletter />
      <Footer />
    </div>
  )
}
