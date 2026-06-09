"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    {
      q: "Can I switch plans anytime?",
      a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      q: "Is there a free trial?",
      a: "Our Starter plan is completely free with unlimited stock trades and real-time data.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, debit cards, UPI, and net banking for hassle-free payments.",
    },
    {
      q: "Are there any hidden charges?",
      a: "No, our pricing is completely transparent. There are no hidden charges or surprise fees.",
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
    },
    {
      q: "Can I get a custom plan for my organization?",
      a: "Contact our sales team to discuss custom pricing for Enterprise solutions.",
    },
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden bg-background">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <span className="font-medium text-foreground text-left">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary flex-shrink-0 transition-transform ${
                    open === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === idx && (
                <div className="px-6 py-4 border-t border-border bg-background text-muted-foreground">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
