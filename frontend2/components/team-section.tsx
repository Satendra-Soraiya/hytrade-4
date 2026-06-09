export default function TeamSection() {
  const team = [
    {
      name: "Raj Kumar",
      role: "Founder & CEO",
      bio: "Former Goldman Sachs trader with 15+ years of market experience.",
    },
    {
      name: "Priya Sharma",
      role: "CTO",
      bio: "Tech lead who built trading systems for major financial institutions.",
    },
    {
      name: "Amit Patel",
      role: "COO",
      bio: "Operations expert managing 1.6M+ daily transactions securely.",
    },
    {
      name: "Neha Singh",
      role: "Head of Product",
      bio: "Product visionary designing intuitive trading experiences.",
    },
    {
      name: "Vikram Desai",
      role: "Head of Security",
      bio: "Cybersecurity expert with credentials from top global firms.",
    },
    {
      name: "Anita Gupta",
      role: "Customer Success",
      bio: "Dedicated to ensuring every customer achieves their financial goals.",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground">Experienced professionals dedicated to your success</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="p-6 bg-card rounded-lg border border-border">
              <div className="h-12 w-12 bg-primary rounded-full mb-4" />
              <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
              <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
