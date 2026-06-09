import ProductsHero from "@/components/products-hero"
import FeaturesGrid from "@/components/features-grid"
import UseCases from "@/components/use-cases"

export const metadata = {
  title: "Trading Products | HYtrade",
  description:
    "Explore HYtrade's comprehensive suite of trading products including stocks, options, mutual funds, and ETFs.",
}

export default function ProductsPage() {
  return (
    <>
      <ProductsHero />
      <FeaturesGrid />
      <UseCases />
    </>
  )
}
