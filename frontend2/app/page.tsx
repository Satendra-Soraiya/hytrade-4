"use client"

import { useEffect, useState } from "react"
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
 

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

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
      }
    } catch {}
  }, [])

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
