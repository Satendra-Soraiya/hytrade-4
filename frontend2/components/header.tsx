"use client"

import { Moon, Sun, TrendingUp, Rocket } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface HeaderProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hytrade-frontend.vercel.app'
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://hytrade-dashboard.vercel.app'
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-foreground">HYtrade</span>
          </div>

          {/* Navigation */}
          <nav className="hidden gap-8 md:flex">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
              className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-foreground" />
              )}
            </button>
            <a href={`${appUrl}/login`} className="hidden text-sm font-medium text-foreground hover:text-primary sm:inline">
              Login
            </a>
            <a href={`${appUrl}/signup`}>
              <Button className="hidden bg-primary hover:bg-primary/90 text-primary-foreground sm:inline-flex">
                Sign Up
              </Button>
            </a>
            <a href={dashboardUrl} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
              <Rocket className="h-4 w-4" />
              Launch App
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
