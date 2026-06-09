import { Check } from "lucide-react"

export default function PricingTiers() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for beginners",
      features: [
        "Stocks & Mutual Funds",
        "Real-time market data",
        "Basic charting",
        "1 watchlist",
        "Mobile app access",
        "Email support",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹499",
      period: "/month",
      description: "For active traders",
      features: [
        "All Starter features",
        "Options & Futures trading",
        "Advanced charting (60+ indicators)",
        "10 watchlists",
        "Basket orders",
        "API access",
        "Priority support",
        "Advanced analytics",
      ],
      cta: "Start Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For institutions",
      features: [
        "All Pro features",
        "Dedicated account manager",
        "Custom integrations",
        "Unlimited API calls",
        "White-label solutions",
        "24/7 phone support",
        "Advanced risk management",
        "Custom reporting",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30 dark:bg-muted/10 text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-lg border transition-all ${
                tier.highlighted
                  ? "border-red-500 bg-background dark:bg-muted/30 shadow-lg shadow-red-500/20 scale-105 md:scale-100 md:ring-1 md:ring-red-500/50"
                  : "border-border bg-background dark:bg-muted/20"
              }`}
            >
              <div className="p-6 sm:p-8">
                {tier.highlighted && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Recommended</p>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mb-8 ${
                    tier.highlighted
                      ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                      : "bg-muted dark:bg-muted/50 text-foreground hover:bg-muted/80 dark:hover:bg-muted/70"
                  }`}
                >
                  {tier.cta}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
