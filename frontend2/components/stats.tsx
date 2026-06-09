"use client"

export default function Stats() {
  const items = [
    { value: "25", label: "NSE stocks to practice" },
    { value: "₹1L", label: "Starting paper balance" },
    { value: "Live", label: "Portfolio & P&L tracking" },
  ]

  return (
    <section className="border-y border-border/80 bg-card/50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:gap-8">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
