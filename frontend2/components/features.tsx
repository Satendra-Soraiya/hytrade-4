"use client"

import { Users, Bell, Zap, TrendingUp } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Users,
      title: "Customer-first Always",
      description:
        "1.6+ crore customers trust HYtrade with ₹6 lakh crores of equity investments contributing to 15% of daily retail exchange volumes in India.",
    },
    {
      icon: Bell,
      title: "No Spam or Gimmicks",
      description:
        "No gimmicks, spam, or annoying push notifications. High quality apps that you use at your pace, the way you like.",
    },
    {
      icon: Zap,
      title: "The HYtrade Universe",
      description:
        "Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer you tailored services specific to your needs.",
    },
    {
      icon: TrendingUp,
      title: "Do Better with Money",
      description:
        "With initiatives like Nudge and Kill Switch, we don't just facilitate transactions, but actively help you do better with your money.",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Trust with <span className="text-primary">Confidence</span>
          </h2>
          <p className="text-lg text-foreground/60 mt-4 max-w-2xl mx-auto">
            Your financial success is our priority. Experience the difference with HYtrade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-8 border border-border rounded-2xl bg-card hover:border-primary/50 transition-colors hover:shadow-lg"
              >
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
