"use client"

import { useState } from "react"
import { validatePasswordStrength, formatValidationErrors } from "@/lib/auth"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [backendStatus, setBackendStatus] = useState("")

  const getApiUrl = () => {
    let api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"
    try {
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        const u = new URL(api)
        if (u.protocol === "http:") {
          u.protocol = "https:"
          api = u.toString().replace(/\/$/, "")
        }
      }
    } catch {}
    return api
  }

  const getDashboardUrl = () => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    const envDash = process.env.NEXT_PUBLIC_DASHBOARD_URL
    const fallback = isLocal ? "http://localhost:5174" : "https://dashboard.hytrade.in"
    return envDash || fallback
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setBackendStatus("")

    const messages: string[] = []
    if (!firstName.trim()) messages.push("First name is required")
    if (!lastName.trim()) messages.push("Last name is required")
    if (!email.trim()) messages.push("Email is required")
    else if (!/\S+@\S+\.\S+/.test(email)) messages.push("Please enter a valid email address")
    if (!password) messages.push("Password is required")
    else {
      const strength = validatePasswordStrength(password)
      if (!strength.isValid) messages.push(...strength.errors)
    }
    if (password !== confirmPassword) messages.push("Passwords do not match")

    if (messages.length) {
      setError(messages.join("\n"))
      setLoading(false)
      return
    }

    try {
      setBackendStatus("Connecting to server…")
      const API_URL = getApiUrl()
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })
      const data = await res.json()
      setBackendStatus("Server response received")

      if (res.ok && data.success && data.message === "Account created successfully") {
        if (data.token && data.user && data.session) {
          localStorage.setItem("authToken", data.token)
          localStorage.setItem("sessionId", data.sessionId)
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("session", JSON.stringify(data.session))
          localStorage.setItem("isLoggedIn", "true")
          setSuccess("Welcome to Hytrade. Your account has been created.")
          setBackendStatus("Account created. Session established. Redirecting to dashboard…")
          const DASHBOARD_URL = getDashboardUrl()
          setTimeout(() => {
            window.location.href = `${DASHBOARD_URL}?token=${data.token}`
          }, 1000)
        } else {
          setSuccess("Account created. Please sign in to continue.")
          setBackendStatus("Account created. Sign in required.")
          setTimeout(() => {
            window.location.href = "/login?message=" + encodeURIComponent("Account created successfully. Please login.")
          }, 1500)
        }
      } else {
        const errorMessage = formatValidationErrors(data)
        setError(`Registration failed:\n${errorMessage}`)
        if (res.status === 400) {
          if (errorMessage.includes("already exists") || data.code === "EMAIL_EXISTS") {
            setBackendStatus("Email already exists. Try signing in instead.")
          } else if (errorMessage.toLowerCase().includes("password")) {
            setBackendStatus("Password requirements not met. Use 8+ characters with upper, lower, number, and symbol.")
          } else if (errorMessage.toLowerCase().includes("email")) {
            setBackendStatus("Invalid email format. Check your email address.")
          } else {
            setBackendStatus(`Validation failed: ${errorMessage.replace(/\n/g, " ")}`)
          }
        } else if (res.status === 500) {
          setBackendStatus("Server error. Please try again later.")
        } else {
          setBackendStatus(`Request failed: ${errorMessage}`)
        }
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your internet connection and try again.")
      setBackendStatus("Connection failed. Check your internet connection.")
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

        {success && (
          <div className="mb-4 rounded-lg bg-green-600/90 p-3 text-sm text-white">{success}</div>
        )}
        {error && (
          <div className="mb-4 whitespace-pre-line rounded-lg border border-red-300/50 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {backendStatus && (
          <div className="mb-4 rounded-lg border border-gray-300/50 bg-gray-50 p-3 text-sm text-gray-700">{backendStatus}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

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
              placeholder="Min 8 chars, upper, lower, number & symbol"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters with uppercase, lowercase, a number, and a special character (e.g. Monty1!)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <a href="/login" className="font-semibold text-primary hover:underline">Log in</a>
        </p>
      </div>
    </main>
  )
}
