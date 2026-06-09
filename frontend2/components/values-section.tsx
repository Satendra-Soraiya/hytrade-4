import { TrendingUp, Shield, Users, Zap } from "lucide-react"

export default function ValuesSection() {
  const values = [
    {
      icon: TrendingUp,
      title: "Innovation First",
      description: "We continuously develop cutting-edge trading tools and features to keep you ahead of the market.",
    },
    {
      icon: Shield,
      title: "Security & Trust",
      description: "Your funds and data are protected with bank-grade encryption and multi-layer security protocols.",
    },
    {
      icon: Users,
      title: "Customer Obsession",
      description:
        "Your success is our priority. We're here 24/7 to support your trading journey with expert guidance.",
    },
    {
      icon: Zap,
      title: "Speed & Reliability",
      description: "Execute trades in milliseconds with our ultra-fast infrastructure and 99.99% uptime guarantee.",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
          <p className="text-lg text-muted-foreground">Principles that guide everything we do</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, idx) => {
            const Icon = value.icon
            return (
              <div
                key={idx}
                className="p-6 bg-background rounded-lg border border-border hover:border-primary transition-colors"
              >
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
