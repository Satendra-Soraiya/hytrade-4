import { BarChart3, TrendingUp, Shield, Zap, PieChart, BookOpen } from "lucide-react"

export default function FeaturesGrid() {
  const features = [
    {
      icon: BarChart3,
      title: "Stock Trading",
      description: "Trade NSE and BSE stocks with zero commission and real-time price updates",
    },
    {
      icon: TrendingUp,
      title: "Options Trading",
      description: "Access unlimited options strategies with advanced charting tools",
    },
    {
      icon: PieChart,
      title: "Mutual Funds",
      description: "Invest in curated mutual fund portfolios with expert recommendations",
    },
    {
      icon: BookOpen,
      title: "ETFs",
      description: "Build diversified portfolios with our extensive ETF collection",
    },
    {
      icon: Zap,
      title: "Fast Execution",
      description: "Millisecond order execution with 99.99% uptime guarantee",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-grade security with end-to-end encryption for all transactions",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Trading Products</h2>
          <p className="text-lg text-muted-foreground">Everything you need to trade smarter</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="p-8 bg-background rounded-lg border border-border hover:border-primary transition-colors"
              >
                <Icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
