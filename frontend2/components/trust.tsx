export default function Trust() {
  const trustPoints = [
    {
      icon: "👥",
      title: "Customer-first Always",
      description:
        "1.6+ crore customers trust HYtrade with ₹6 lakh crores of equity investments contributing to 15% of daily retail exchange volumes in India.",
    },
    {
      icon: "🔔",
      title: "No Spam or Gimmicks",
      description:
        "No gimmicks, spam, or annoying push notifications. High quality apps that you use at your pace, the way you like.",
    },
    {
      icon: "⚡",
      title: "The HYtrade Universe",
      description:
        "Not just an app, but a whole ecosystem. Our investments in 30+ fintech startups offer you tailored services specific to your needs.",
    },
    {
      icon: "💰",
      title: "Do Better with Money",
      description:
        "With initiatives like Nudge and Kill Switch, we don't just facilitate transactions, but actively help you do better with your money.",
    },
  ]

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
          Trust with <span className="text-primary">Confidence</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
            >
              <div className="text-4xl mb-4">{point.icon}</div>
              <h3 className="text-xl font-bold mb-3">{point.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
