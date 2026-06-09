"use client"

import { CheckCircle2, TrendingUp } from "lucide-react"

export default function WhyChoose() {
  const benefits = [
    "Zero commission on equity delivery trades",
    "Advanced charting and technical analysis tools",
    "Real-time market data and insights",
    "Seamless fund transfers and withdrawals",
    "24/7 customer support for all your queries",
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Why Choose <span className="text-primary">HYtrade?</span>
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <TrendingUp className="w-16 h-16 text-primary mx-auto opacity-20" />
              <p className="text-foreground/40 text-sm">Interactive benefits showcase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
