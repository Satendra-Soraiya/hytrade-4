export default function UseCases() {
  const cases = [
    {
      title: "Day Trading",
      description:
        "Execute multiple trades throughout the day with real-time market insights and technical analysis tools.",
    },
    {
      title: "Long-term Investing",
      description:
        "Build wealth through diversified portfolios with automated rebalancing and goal-based recommendations.",
    },
    {
      title: "Options Strategies",
      description: "Execute complex options strategies like spreads, straddles, and iron condors with expert guidance.",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Use Cases</h2>
          <p className="text-lg text-muted-foreground">HYtrade adapts to your trading style</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((useCase, idx) => (
            <div key={idx} className="p-8 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-muted-foreground">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
