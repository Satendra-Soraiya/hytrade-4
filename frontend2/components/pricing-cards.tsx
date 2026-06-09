import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function PricingCards() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      description: "Perfect for beginners",
      features: [
        "Unlimited stock trades",
        "Real-time market data",
        "Basic technical analysis",
        "Email support",
        "Mobile app access",
        "Portfolio tracking",
      ],
    },
    {
      name: "Pro",
      price: "499",
      description: "For active traders",
      popular: true,
      features: [
        "Everything in Starter",
        "Advanced charting tools",
        "Options trading",
        "Priority support",
        "API access",
        "Custom alerts",
        "Multiple watchlists",
        "Advanced analytics",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For institutions",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
        "Bulk trading",
        "Risk management tools",
        "Advanced reporting",
        "SLA guarantee",
      ],
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-lg border transition-all ${
                plan.popular
                  ? "border-primary bg-background ring-2 ring-primary scale-105"
                  : "border-border bg-background"
              }`}
            >
              {plan.popular && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Recommended</p>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price === "Custom" ? "Custom" : `₹${plan.price}`}
                </span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Get Started
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
