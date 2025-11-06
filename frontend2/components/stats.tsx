"use client"

export default function Stats() {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">₹6L+</div>
            <div className="text-foreground/60 mt-2">Daily Volume</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">15%</div>
            <div className="text-foreground/60 mt-2">Market Share</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary">30+</div>
            <div className="text-foreground/60 mt-2">Fintech Partners</div>
          </div>
        </div>
      </div>
    </section>
  )
}
