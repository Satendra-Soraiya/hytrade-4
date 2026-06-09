export default function AboutHero() {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Democratizing Stock Trading for Everyone
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          HYtrade was founded on the belief that advanced trading tools and market insights should be accessible to
          every investor, regardless of their experience level.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">1.6M+</div>
            <p className="text-muted-foreground">Active Traders</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">₹6L+</div>
            <p className="text-muted-foreground">Daily Volume</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">15%</div>
            <p className="text-muted-foreground">Market Share</p>
          </div>
        </div>
      </div>
    </section>
  )
}
