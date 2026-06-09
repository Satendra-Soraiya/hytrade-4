"use client"

import { BarChart3, Bell, Shield, Wallet } from "lucide-react"

export default function Trust() {
  const trustPoints = [
    {
      icon: Wallet,
      title: "INR paper wallet",
      description:
        "Practice with a virtual balance and a ledger that mirrors how real brokerage accounts track cash and holdings.",
    },
    {
      icon: Bell,
      title: "No noise",
      description:
        "No gimmicks or spammy notifications — just a focused workspace for learning how to trade NSE equities.",
    },
    {
      icon: BarChart3,
      title: "Built for practice",
      description:
        "Watchlists, portfolio views, and trade history help you build habits before putting real money at risk.",
    },
    {
      icon: Shield,
      title: "Safe by design",
      description:
        "Paper trading only. No bank linking, no live orders, and no capital at stake while you learn.",
    },
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">
          Trade with <span className="text-primary">confidence</span>
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          {trustPoints.map((point) => {
            const Icon = point.icon
            return (
              <div
                key={point.title}
                className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{point.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{point.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
