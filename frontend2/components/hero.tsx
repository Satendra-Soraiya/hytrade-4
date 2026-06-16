"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.06),transparent_50%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 md:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Practice Indian markets with a{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  real dashboard
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Trade 25 NSE stocks with an INR paper wallet, live-style quotes, portfolio tracking, and zero risk.
                Build confidence before you invest real capital.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/15">
                <Link href="/signup">
                  Start paper trading
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-semibold">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-border/80 pt-8">
              <div>
                <div className="text-2xl font-bold text-foreground md:text-3xl">25</div>
                <div className="mt-1 text-sm text-muted-foreground">NSE instruments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground md:text-3xl">₹1L</div>
                <div className="mt-1 text-sm text-muted-foreground">Paper wallet</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground md:text-3xl">0%</div>
                <div className="mt-1 text-sm text-muted-foreground">Real money risk</div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio value</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">₹1,00,000</p>
                  <p className="mt-1 text-sm font-medium text-emerald-500">+2.4% today</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="mb-6 h-36 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex h-full items-end gap-1.5">
                  {[42, 58, 48, 72, 64, 88, 76].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-primary/70"
                      style={{ height: `${h}%`, opacity: 0.45 + i * 0.08 }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Top holdings</p>
                {[
                  { symbol: "RELIANCE", price: "₹1,285", change: "+0.8%" },
                  { symbol: "TCS", price: "₹4,050", change: "+1.2%" },
                  { symbol: "HDFCBANK", price: "₹1,720", change: "+0.5%" },
                ].map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm">
                    <span className="font-medium text-foreground">{stock.symbol}</span>
                    <div className="text-right">
                      <div className="text-foreground">{stock.price}</div>
                      <div className="text-xs font-medium text-emerald-500">{stock.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
