"use client"

import { ArrowRight, TrendingUp, Shield } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-20 pb-40 md:pt-32 md:pb-48 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by many traders</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Invest in <span className="text-primary">Everything</span>
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Your trusted partner in online trading and investment. Start your financial journey with our advanced
                trading platform.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Stocks & Mutual Funds</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Secure Trading</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2">
                Start Trading Now <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border border-border bg-card hover:bg-muted transition-colors rounded-lg font-semibold">
                Try Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">₹6L+</div>
                <div className="text-sm text-foreground/60">Daily Volume</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">15%</div>
                <div className="text-sm text-foreground/60">Market Share</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">30+</div>
                <div className="text-sm text-foreground/60">Fintech Partners</div>
              </div>
            </div>
          </div>

          {/* Right Dashboard Preview */}
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-[520px] ml-auto">
              <div className="space-y-6">
                {/* Dashboard Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-foreground/60">Portfolio Value</div>
                    <div className="text-3xl font-bold text-foreground mt-2">$2270.25</div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Simple Chart */}
                <div className="space-y-2">
                  <div className="h-32 bg-muted/50 rounded-lg flex items-end gap-1 p-3">
                    <div className="flex-1 h-12 bg-primary/40 rounded-t" />
                    <div className="flex-1 h-16 bg-primary/60 rounded-t" />
                    <div className="flex-1 h-20 bg-primary rounded-t" />
                    <div className="flex-1 h-14 bg-primary/50 rounded-t" />
                    <div className="flex-1 h-24 bg-primary/70 rounded-t" />
                  </div>
                  <div className="flex justify-between text-xs text-foreground/40">
                    <span>1W</span>
                    <span>Now</span>
                  </div>
                </div>

                {/* Holdings */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground">Recent Holdings</div>
                  {[
                    { symbol: "AAPL", price: "$180.50", change: "+2.5%" },
                    { symbol: "TSLA", price: "$250.00", change: "+1.2%" },
                  ].map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{stock.symbol}</span>
                      <div className="text-right">
                        <div className="text-foreground">{stock.price}</div>
                        <div className="text-primary text-xs">{stock.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
