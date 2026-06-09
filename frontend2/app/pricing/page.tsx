import PricingHero from "@/components/pricing-hero"
import PricingCards from "@/components/pricing-cards"
import ComparisonTable from "@/components/comparison-table"
import PricingFAQ from "@/components/pricing-faq"

export const metadata = {
  title: "Pricing | HYtrade",
  description: "Transparent and affordable pricing for all traders. Choose the plan that fits your trading style.",
}

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingCards />
      <ComparisonTable />
      <PricingFAQ />
    </>
  )
}
