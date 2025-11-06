"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Menu, X, ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
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
