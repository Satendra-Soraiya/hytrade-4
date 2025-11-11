"use client"

import { useEffect, useState } from "react"
import { getApiUrl as resolveApiUrl } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    const url = new URL(window.location.href)
    const message = url.searchParams.get("message")
    if (message) {
      setInfo(message)
      url.searchParams.delete("message")
      window.history.replaceState({}, document.title, url.pathname)
    }
  }, [])

  const getApiUrl = () => {
    // Use shared helper:
    // - Returns '' on hytrade.in/www.hytrade.in for same-origin proxying
    // - Uses localhost in dev
    // - Falls back to https://hytrade-backend.onrender.com when env is missing
    return resolveApiUrl()
  }

  const getDashboardUrl = () => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    const envDash = process.env.NEXT_PUBLIC_DASHBOARD_URL
    const fallback = isLocal ? "http://localhost:5173" : "https://dashboard.hytrade.in"
    return envDash || fallback
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const API_URL = getApiUrl()
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      let data: any
      try {
        data = await res.json()
      } catch {
        data = { success: false, message: `Login failed (invalid response). Status: ${res.status}` }
      }
      if (data.success && data.token) {
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("sessionId", data.sessionId)
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
        if (data.session) localStorage.setItem("session", JSON.stringify(data.session))
        localStorage.setItem("isLoggedIn", "true")
        // Show immediate welcome message before redirecting
        try {
          setInfo(`🎉 Welcome ${data?.user?.firstName || data?.user?.name || "to Hytrade"}! Redirecting...`)
        } catch {}
        const DASHBOARD_URL = getDashboardUrl()
        // Small delay so user can see the welcome message
        setTimeout(() => {
          window.location.href = `${DASHBOARD_URL}?token=${data.token}`
        }, 800)
      } else {
        setError(data.message || "Login failed. Please check your credentials.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <a href="/"><img src="/logo.png" alt="Hytrade" className="mx-auto h-16 w-auto" /></a>
        </div>

        {info && (
          <div className="mb-4 rounded-lg border border-blue-300/50 bg-blue-50/50 p-3 text-sm text-blue-800">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/50 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don\'t have an account? <a href="/signup" className="font-semibold text-primary hover:underline">Create one</a>
        </p>
      </div>
    </main>
  )
}
