"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]))

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

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems)
    if (newOpen.has(index)) {
      newOpen.delete(index)
    } else {
      newOpen.add(index)
    }
    setOpenItems(newOpen)
  }

  if (!mounted) return null

  const faqs = [
    {
      category: "Account",
      items: [
        {
          q: "How do I open an account?",
          a: "Visit our website, click Sign Up, complete KYC verification (takes 5 mins), and start trading immediately.",
        },
        {
          q: "What documents do I need?",
          a: "Aadhaar, PAN card, and a cancelled cheque. We accept both eKYC and offline verification.",
        },
        { q: "Is there any account opening fee?", a: "No, account opening is completely free. No hidden charges." },
      ],
    },
    {
      category: "Trading",
      items: [
        {
          q: "What are the trading hours?",
          a: "Markets open 9:15 AM - 3:30 PM on weekdays. After-hours trading available 3:40 PM - 4:00 PM.",
        },
        {
          q: "What is the minimum amount to start?",
          a: "You can start with as low as ₹1. There's no minimum investment limit.",
        },
        {
          q: "Can I short sell?",
          a: "Yes, short selling is available on all stocks. Margin requirement is 40% of position value.",
        },
      ],
    },
    {
      category: "Support",
      items: [
        { q: "How do I contact support?", a: "Chat, email, phone, or Twitter. Response time under 5 minutes on chat." },
        { q: "What are support hours?", a: "We're available 24/7 for urgent issues. Regular support 6 AM - 12 AM." },
        {
          q: "Is support available on weekends?",
          a: "Yes, emergency support is 24/7. Markets operations support on trading days.",
        },
      ],
    },
    {
      category: "Security",
      items: [
        {
          q: "Is my money safe?",
          a: "All client funds are held in separate bank accounts with 100% insurance protection.",
        },
        {
          q: "What security features are available?",
          a: "256-bit SSL encryption, 2FA, biometric login, and real-time fraud detection.",
        },
        {
          q: "Can my account be hacked?",
          a: "We use industry-leading security. Your funds are insured against fraud.",
        },
      ],
    },
  ]

  let itemIndex = 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about HYtrade.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {faqs.map((section, sIdx) => (
                <div key={sIdx}>
                  <h2 className="text-2xl font-bold mb-6 text-primary">{section.category}</h2>
                  <div className="space-y-4">
                    {section.items.map((item, idx) => {
                      const currentIndex = itemIndex++
                      return (
                        <div key={idx} className="bg-card rounded-lg border border-border overflow-hidden">
                          <button
                            onClick={() => toggleItem(currentIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
                          >
                            <h3 className="font-semibold">{item.q}</h3>
                            <span className="text-primary">{openItems.has(currentIndex) ? "−" : "+"}</span>
                          </button>
                          {openItems.has(currentIndex) && (
                            <div className="px-6 py-4 bg-secondary/30 border-t border-border text-muted-foreground">
                              {item.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-card">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8 text-lg">Our support team is ready to help.</p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Contact Support
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
