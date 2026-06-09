import { Check } from "lucide-react"

function CellMark({ included }: { included: boolean }) {
  return (
    <td className="px-4 py-4 text-center">
      {included ? (
        <Check className="mx-auto h-4 w-4 text-primary" aria-label="Included" />
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </td>
  )
}

export default function ComparisonTable() {
  const features = [
    "Unlimited stock trades",
    "Real-time market data",
    "Technical analysis tools",
    "Options trading",
    "Advanced charting",
    "Priority support",
    "API access",
    "Custom alerts",
    "Multiple watchlists",
    "Dedicated account manager",
    "White-label solutions",
  ]

  const starterIncludes = new Set([
    "Unlimited stock trades",
    "Real-time market data",
    "Technical analysis tools",
  ])
  const proExcludes = new Set(["Dedicated account manager", "White-label solutions"])

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground sm:text-4xl">Feature comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-4 text-left font-bold text-foreground">Feature</th>
                <th className="px-4 py-4 text-center font-bold text-foreground">Starter</th>
                <th className="px-4 py-4 text-center font-bold text-foreground">Pro</th>
                <th className="px-4 py-4 text-center font-bold text-foreground">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature} className="border-b border-border">
                  <td className="px-4 py-4 text-muted-foreground">{feature}</td>
                  <CellMark included={starterIncludes.has(feature)} />
                  <CellMark included={!proExcludes.has(feature)} />
                  <CellMark included />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
