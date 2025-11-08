"use client"

export default function Products() {
  const products = ["Streak", "Ditto Insurance", "Console", "Kite", "Sensibull", "Coin", "Smallcase", "Tijori"]

  return (
    <section className="py-20 md:py-32 bg-card/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powered by <span className="text-primary">Innovation</span>
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="p-8 border border-border rounded-xl bg-background hover:border-primary/50 transition-colors hover:shadow-lg hover:-translate-y-1 duration-300 cursor-pointer flex items-center justify-center"
            >
              <span className="text-lg font-semibold text-foreground text-center">{product}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
