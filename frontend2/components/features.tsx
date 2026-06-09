"use client"

import { BarChart3, Bell, Shield, Wallet } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Wallet,
      title: "INR paper wallet",
      description: "Start with ₹1,00,000 virtual balance. Every buy and sell updates your ledger like a real brokerage account.",
    },
    {
      icon: BarChart3,
      title: "Real NSE instruments",
      description: "Practice on 25 liquid NSE stocks with market-style quotes, watchlists, and a portfolio timeline.",
    },
    {
      icon: Shield,
      title: "Zero financial risk",
      description: "Paper trading only — no bank linking, no real orders. Learn execution and risk management safely.",
    },
    {
      icon: Bell,
      title: "Clean, focused UX",
      description: "A dashboard built for clarity: trade, track holdings, and review performance without clutter or gimmicks.",
    },
  ]

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to <span className="text-primary">practice well</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hytrade mirrors the flow of real trading while keeping your capital completely safe.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/80 bg-card/40 p-6 transition-colors hover:border-primary/30 hover:bg-card/70"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
