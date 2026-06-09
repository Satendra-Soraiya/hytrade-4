import AboutHero from "@/components/about-hero"
import TeamSection from "@/components/team-section"
import ValuesSection from "@/components/values-section"

export const metadata = {
  title: "About HYtrade | Our Mission & Story",
  description: "Learn about HYtrade's mission to democratize stock trading with advanced tools and secure platform.",
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <ValuesSection />
      <TeamSection />
    </>
  )
}
